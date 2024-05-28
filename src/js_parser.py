import re
from datetime import datetime, timedelta

def parse_course_data(file_path):
    with open(file_path, 'r') as file:
        data = file.read()

    courses = []
    current_course = None
    current_type = None

    lines = data.splitlines()
    for line in lines:
        line = line.strip()
        if line.startswith('('):
            course_name = line.split(':')[0].strip()
            current_course = {
                'title': course_name,
                'id': len(courses),
                'lectures': []
            }
            courses.append(current_course)
        elif line in ['הרצאה', 'תרגול', 'מעבדה']:
            current_type = line
        elif re.match(r'^[א-ת]', line):  # Matches lines starting with Hebrew letters
            parts = line.split()
            day = parts[0].strip()
            start_time = parts[1].strip()
            end_time = parts[2].strip()
            lecturer = parts[3].strip()
            location = parts[4].strip()

            # Convert Hebrew day to English day
            day_map = {
                'א': 'Sunday',
                'ב': 'Monday',
                'ג': 'Tuesday',
                'ד': 'Wednesday',
                'ה': 'Thursday',
                'ו': 'Friday'
            }
            english_day = day_map[day]

            # Parse start and end times
            start_time = datetime.strptime(start_time, '%H:%M')
            end_time = datetime.strptime(end_time, '%H:%M')

            # Construct datetime objects for start and end dates
            today = datetime.today()
            start_datetime = today.replace(hour=start_time.hour, minute=start_time.minute)
            end_datetime = today.replace(hour=end_time.hour, minute=end_time.minute)

            # Adjust end_datetime to the next day if it's past midnight
            if end_datetime < start_datetime:
                end_datetime += timedelta(days=1)

            # Append the lecture details to current_course
            current_course['lectures'].append({
                'title': current_course['title'],
                'startDate': start_datetime,
                'endDate': end_datetime,
                'id': len(current_course['lectures']),
                'location': location,
                'lecturer': lecturer,
                'type': current_type.lower(),  # lowercase type as per your example
                'day': english_day
            })

    return courses

# Example usage:
file_path = 'all_courses.txt'  # Replace with your file path
courses = parse_course_data(file_path)

# Print out the formatted course data
for course in courses:
    for lecture in course['lectures']:
        print(lecture)
