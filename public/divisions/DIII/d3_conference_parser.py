import pandas as pd
import json

conferences_path = "public/divisions/DIII/d3_conferences.csv"
conferences_df = pd.read_csv(conferences_path)

conferences_df.columns = conferences_df.columns.str.strip()
conferences_df["School"] = conferences_df["School"].str.strip()
conferences_df["Conference"] = conferences_df["Conference"].str.strip()

conference_ids = {name: idx + 1 for idx, name in enumerate(conferences_df["Conference"].dropna().unique())}
college_ids = {school: idx + 1 for idx, school in enumerate(conferences_df["School"].unique())}

placeholder_conference_id = max(conference_ids.values(), default=0) + 1
conference_ids["Unmatched"] = placeholder_conference_id

conference_objects = []
college_objects = []

for conference_name, conference_id in conference_ids.items():
    if conference_name == "Unmatched":
        continue  # Skip unmatched for now
    conference_teams = conferences_df[conferences_df["Conference"] == conference_name]["School"].tolist()
    team_ids = [college_ids[team] for team in conference_teams]

    # Append Conference object
    conference_objects.append({
        "conferenceId": conference_id,
        "conferenceName": conference_name,
        "teamIds": team_ids
    })

conference_objects.append({
    "conferenceId": placeholder_conference_id,
    "conferenceName": "Unmatched",
    "teamIds": []
})

for _, row in conferences_df.iterrows():
    college_id = college_ids[row["School"]]
    conference_id = conference_ids.get(row["Conference"], placeholder_conference_id)  # Default to unmatched

    college_objects.append({
        "collegeId": college_id,
        "college": row["School"],
        "conferenceId": conference_id,
        "city": row["City"],
        "state": row["State"],
        "nickname": row["Nickname"],
    })

    # Add to unmatched conference teamIds if applicable
    if conference_id == placeholder_conference_id:
        for conf in conference_objects:
            if conf["conferenceId"] == placeholder_conference_id:
                conf["teamIds"].append(college_id)

output_data = {
    "conferences": conference_objects,
    "colleges": college_objects
}

output_path = "public/divisions/DIII/d3_conferences_teams.csv"
with open(output_path, "w") as json_file:
    json.dump(output_data, json_file, indent=4)

unmatched_count = len([
    college for college in college_objects if college["conferenceId"] == placeholder_conference_id
])
print(f"Unmatched Colleges Count: {unmatched_count}")
print(f"Output Path: {output_path}")
