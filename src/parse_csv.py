import pandas as pd

# Read the CSV file
df = pd.read_csv('course_data.csv')

# Initialize the JavaScript file content
js_content = 'export const appointments = [\n'

# Iterate over the rows of the DataFrame and format them into JS objects
for idx, row in df.iterrows():
    # Example: {'course_name': 'Introduction to Python', 'day': 'Monday', 'time': '10:00-12:00'}
    course_number = row['course_number']
    course_name = row['course_name']
    course_type = row['course_type']
    lecturer_name = row['lecturer_name']
    course_class_number = row['course_class_number']
    day = row['day']
    start_time, end_time = row['time'].split('-')

    # Remove leading zeros from minutes
    start_hour, start_minute = start_time.split(':')
    end_hour, end_minute = end_time.split(':')
    start_minute = start_minute.lstrip('0') if start_minute != '00' else '0'
    end_minute = end_minute.lstrip('0') if end_minute != '00' else '0'

    # Example date for simplicity, replace with actual logic to get start and end dates
    js_content += f'  {{\n'
    js_content += f'    title: "{course_name} - {course_type}",\n'
    js_content += f'    startDate: new Date(2018, 5, {25 + idx}, {start_hour}, {start_minute}),\n'
    js_content += f'    endDate: new Date(2018, 5, {25 + idx}, {end_hour}, {end_minute}),\n'
    js_content += f'    id: {idx},\n'
    js_content += f'    location: "Room {course_class_number}"\n'
    js_content += f'  }},\n'

# Close the JavaScript array
js_content += '];\n'

# Write the content to a .js file
with open('appointments.js', 'w') as js_file:
    js_file.write(js_content)
