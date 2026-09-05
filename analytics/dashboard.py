import streamlit as st
import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Page config
st.set_page_config(page_title="E-Learning Analytics", layout="wide")

# Try Streamlit secrets first (for deployed app), fallback to .env (for local dev)
try:
    mongo_uri = st.secrets["MONGO_URI"]
except:
    load_dotenv('../backend/.env')
    mongo_uri = os.getenv('MONGO_URI')

client = MongoClient(mongo_uri)
db = client['elearning']

# Load data
@st.cache_data
def load_data():
    users_df = pd.DataFrame(list(db['users'].find()))
    courses_df = pd.DataFrame(list(db['courses'].find()))
    enrollments_df = pd.DataFrame(list(db['enrollments'].find()))
    events_df = pd.DataFrame(list(db['events'].find()))
    return users_df, courses_df, enrollments_df, events_df

users_df, courses_df, enrollments_df, events_df = load_data()

# Title
st.title("📊 E-Learning Platform Analytics Dashboard")
st.markdown("Real-time insights into user behavior, funnels, and course performance.")

# Top-level metrics
col1, col2, col3, col4 = st.columns(4)
col1.metric("Total Students", len(users_df[users_df['role'] == 'student']))
col2.metric("Total Courses", len(courses_df))
col3.metric("Total Enrollments", len(enrollments_df))
completed_count = len(enrollments_df[enrollments_df['status'] == 'completed'])
col4.metric("Courses Completed", completed_count)

st.divider()

# --- FUNNEL ANALYSIS ---
st.header("🔻 User Funnel")

funnel_steps = ['signup', 'course_view', 'enroll', 'lesson_complete', 'course_complete']
funnel_counts = {}
for step in funnel_steps:
    unique_users = events_df[events_df['eventType'] == step]['user'].nunique()
    funnel_counts[step] = unique_users

funnel_df = pd.DataFrame(list(funnel_counts.items()), columns=['Step', 'Unique Users'])
funnel_df['Conversion from Signup (%)'] = (
    funnel_df['Unique Users'] / funnel_df['Unique Users'].iloc[0] * 100
).round(1)

col_chart, col_table = st.columns([2, 1])
with col_chart:
    st.bar_chart(funnel_df.set_index('Step')['Unique Users'])
with col_table:
    st.dataframe(funnel_df, hide_index=True)

st.divider()

# --- COMPLETION RATE BY CATEGORY ---
st.header("📚 Completion Rate by Category")

enrollments_merged = enrollments_df.merge(
    courses_df[['_id', 'category']],
    left_on='course', right_on='_id', how='left'
)

category_stats = enrollments_merged.groupby('category').agg(
    total_enrollments=('status', 'count'),
    completed=('status', lambda x: (x == 'completed').sum())
).reset_index()

category_stats['completion_rate (%)'] = (
    category_stats['completed'] / category_stats['total_enrollments'] * 100
).round(1)

category_stats = category_stats.sort_values('completion_rate (%)', ascending=False)

col_chart2, col_table2 = st.columns([2, 1])
with col_chart2:
    st.bar_chart(category_stats.set_index('category')['completion_rate (%)'])
with col_table2:
    st.dataframe(category_stats, hide_index=True)

st.divider()

# --- RAW DATA EXPLORER ---
st.header("🔍 Raw Data Explorer")
data_choice = st.selectbox("Select a dataset to explore:", ['Users', 'Courses', 'Enrollments', 'Events'])

if data_choice == 'Users':
    st.dataframe(users_df.drop(columns=['password']))
elif data_choice == 'Courses':
    st.dataframe(courses_df)
elif data_choice == 'Enrollments':
    st.dataframe(enrollments_df)
elif data_choice == 'Events':
    st.dataframe(events_df)