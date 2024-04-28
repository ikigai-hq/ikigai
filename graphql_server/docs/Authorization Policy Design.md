# Open Assignment RBAC

## Organization Auth Permissions

- Teacher: `org.id = org_member.org_id & org_member.org_role = “Teacher”`
- Student: `org.id = org_member.org_id & org_member.org_role = “Student”`

|         | view_member_public_information | edit_org_member_information | add_org_member | remove_org_member | create_class | remove_class | manage_template | manage_org_information | manage_trash |
|---------|--------------------------------|-----------------------------|----------------|-------------------|--------------|--------------|-----------------|------------------------|--------------|
| Student | ✅                              |                             |                |                   |              |              |                 |                        |              |
| Teacher | ✅                              | ✅                           | ✅              | ✅                 | ✅            | ✅            | ✅               | ✅                      | ✅            |

## Class Auth Permissions

- Teacher: `class.org_id = org_member.org_id & org_member.org_role = “teacher”`
- Student: `org_member.org_role = “student” & class.org_id = org_member.org_id & class_member.class_ids include class_id`

|         | view_class_content | self_enroll                     | manage_class_content | manage_class_member | manage_class_setting |
|---------|--------------------|---------------------------------|----------------------|---------------------|----------------------|
| Student | ✅                  | class.allow_student_self_enroll |                      |                     |                      |
| Teacher | ✅                  | ?                               | ✅                    | ✅                   | ✅                    |

## Document Auth Permissions

- Reader
    - `document.is_published`
    - `document.org_id = org_member.org_id & org_member.org_role = “student”`
- Writer
    - `document.org_id = org_member.org_id & org_member.org_role = “teacher”`

|        | view_document | interactive_with_tool                                                                                                                          | view_answer                                                       | edit_document                                                                                                                                            | manage_document |
|--------|---------------|------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------|
| Reader | ✅             | `document.org_id = org_member.org_id & org_member.org_role = “student" & document.is_doing_submission & document.user_id = org_member.user_id` | `doc.allow_for_student_view_answer and doc.creator_id = actor.id` | `document.org_id = org_member.org_id & org_member.org_role = “student" & document.is_doing_open_type_submission & document.user_id = org_member.user_id` |                 |
| Writer | ✅             | `document.org_id = org_member.org_id & org_member.org_role = “Teacher" & !document.is_doing_submission`                                        | ✅                                                                 | ✅                                                                                                                                                        | ✅               |
