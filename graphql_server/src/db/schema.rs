// @generated automatically by Diesel CLI.

diesel::table! {
    assignment_submissions (id) {
        id -> Int4,
        assignment_id -> Int4,
        user_id -> Int4,
        temp_grade -> Nullable<Float8>,
        feedback -> Nullable<Text>,
        updated_at -> Int8,
        created_at -> Int8,
        document_id -> Uuid,
        attempt_number -> Int4,
        final_grade -> Nullable<Float8>,
        start_at -> Int8,
        feedback_at -> Nullable<Int8>,
        allow_for_student_view_answer -> Bool,
        submit_at -> Nullable<Int8>,
        allow_rework -> Bool,
        can_change_structure -> Bool,
    }
}

diesel::table! {
    assignments (id) {
        id -> Int4,
        updated_at -> Int8,
        created_at -> Int8,
        document_id -> Uuid,
        graded_type -> Int4,
        max_number_of_attempt -> Nullable<Int4>,
        pre_description -> Nullable<Text>,
        test_duration -> Nullable<Int4>,
        band_score_id -> Nullable<Int4>,
        grade_method -> Int4,
        force_auto_submit -> Bool,
        allow_submission_change_structure -> Bool,
        grade_by_rubric_id -> Nullable<Uuid>,
        weighting_into_final_grade -> Float8,
    }
}

diesel::table! {
    band_scores (id) {
        id -> Int4,
        name -> Varchar,
        range -> Jsonb,
        org_id -> Nullable<Int4>,
        updated_at -> Int8,
        created_at -> Int8,
    }
}

diesel::table! {
    document_highlights (uuid) {
        document_id -> Uuid,
        creator_id -> Int4,
        thread_id -> Int4,
        from_pos -> Int4,
        to_pos -> Int4,
        updated_at -> Int8,
        created_at -> Int8,
        uuid -> Uuid,
        highlight_type -> Int4,
        original_text -> Text,
    }
}

diesel::table! {
    document_page_block_nested_documents (page_block_id, document_id) {
        page_block_id -> Uuid,
        document_id -> Uuid,
        index -> Int4,
        created_at -> Int8,
    }
}

diesel::table! {
    document_page_blocks (id) {
        id -> Uuid,
        document_id -> Uuid,
        title -> Text,
        view_mode -> Int4,
        updated_at -> Int8,
        created_at -> Int8,
    }
}

diesel::table! {
    document_template_and_tag (document_template_id, tag) {
        document_template_id -> Uuid,
        tag -> Varchar,
    }
}

diesel::table! {
    document_template_categories (id) {
        id -> Uuid,
        name -> Varchar,
        org_id -> Int4,
        org_internal_index -> Nullable<Int4>,
        is_community -> Bool,
        community_index -> Nullable<Int4>,
        updated_at -> Int8,
        created_at -> Int8,
    }
}

diesel::table! {
    document_template_category_tags (category_id, tag) {
        category_id -> Uuid,
        tag -> Varchar,
    }
}

diesel::table! {
    document_templates (id) {
        id -> Uuid,
        name -> Text,
        document_id -> Uuid,
        org_id -> Int4,
        created_by -> Nullable<Int4>,
        is_published -> Bool,
        updated_at -> Int8,
        created_at -> Int8,
    }
}

diesel::table! {
    document_versions (id) {
        id -> Uuid,
        root_document_id -> Uuid,
        versioning_document_id -> Uuid,
        name -> Text,
        creator_id -> Nullable<Int4>,
        is_auto -> Bool,
        updated_at -> Int8,
        created_at -> Int8,
    }
}

diesel::table! {
    documents (id) {
        id -> Uuid,
        creator_id -> Int4,
        org_id -> Int4,
        parent_id -> Nullable<Uuid>,
        cover_photo_id -> Nullable<Uuid>,
        index -> Int4,
        title -> Text,
        body -> Text,
        is_public -> Bool,
        hide_rule -> Int4,
        editor_config -> Jsonb,
        deleted_at -> Nullable<Int8>,
        updated_by -> Nullable<Int4>,
        last_edited_content_at -> Int8,
        updated_at -> Int8,
        created_at -> Int8,
        space_id -> Nullable<Int4>,
    }
}

diesel::table! {
    files (uuid) {
        uuid -> Uuid,
        user_id -> Int4,
        status -> Int4,
        public -> Bool,
        file_name -> Varchar,
        content_type -> Varchar,
        content_length -> Int8,
        updated_at -> Int8,
        created_at -> Int8,
        download_cached_url -> Nullable<Varchar>,
        download_url_expire_in -> Nullable<Int8>,
        org_id -> Int4,
        transcoding_output_key -> Nullable<Varchar>,
        transcoding_output_content_type -> Nullable<Varchar>,
        transcoding_output_content_length -> Nullable<Int8>,
        waveform_audio_json_str -> Nullable<Text>,
    }
}

diesel::table! {
    organization_members (org_id, user_id) {
        org_id -> Int4,
        user_id -> Int4,
        org_role -> Int4,
        created_at -> Int8,
    }
}

diesel::table! {
    organizations (id) {
        id -> Int4,
        org_name -> Varchar,
        updated_at -> Int8,
        created_at -> Int8,
        owner_id -> Nullable<Int4>,
    }
}

diesel::table! {
    quiz_answers (quiz_id, user_id) {
        quiz_id -> Uuid,
        user_id -> Int4,
        answer -> Jsonb,
        score -> Float8,
        updated_at -> Int8,
        created_at -> Int8,
    }
}

diesel::table! {
    quiz_structures (id) {
        id -> Uuid,
        user_id -> Int4,
        quiz_type -> Int4,
        quiz_title -> Text,
        quiz_body -> Jsonb,
        quiz_answer -> Jsonb,
        updated_at -> Int8,
        created_at -> Int8,
        org_id -> Int4,
        explanation -> Text,
    }
}

diesel::table! {
    quizzes (id) {
        id -> Uuid,
        document_id -> Uuid,
        quiz_structure_id -> Uuid,
        created_at -> Int8,
        deleted_at -> Nullable<Int8>,
    }
}

diesel::table! {
    rubric_submissions (submission_id) {
        submission_id -> Int4,
        rubric_id -> Nullable<Uuid>,
        graded_data -> Jsonb,
        updated_at -> Int8,
        created_at -> Int8,
    }
}

diesel::table! {
    rubrics (id) {
        id -> Uuid,
        org_id -> Int4,
        name -> Text,
        data -> Jsonb,
        updated_at -> Int8,
        created_at -> Int8,
    }
}

diesel::table! {
    space_members (space_id, user_id) {
        space_id -> Int4,
        user_id -> Int4,
        updated_at -> Int8,
        created_at -> Int8,
    }
}

diesel::table! {
    spaces (id) {
        id -> Int4,
        name -> Text,
        updated_at -> Int8,
        created_at -> Int8,
        org_id -> Int4,
        banner_id -> Nullable<Uuid>,
        creator_id -> Int4,
        deleted_at -> Nullable<Int8>,
    }
}

diesel::table! {
    tags (name) {
        name -> Varchar,
        org_id -> Int4,
        use_case -> Int4,
        updated_at -> Int8,
        created_at -> Int8,
    }
}

diesel::table! {
    thread_comments (id) {
        id -> Int8,
        thread_id -> Int4,
        sender_id -> Int4,
        content -> Text,
        updated_at -> Int8,
        created_at -> Int8,
        comment_type -> Int4,
        file_uuid -> Nullable<Uuid>,
    }
}

diesel::table! {
    threads (id) {
        id -> Int4,
        creator_id -> Int4,
        title -> Varchar,
        updated_at -> Int8,
        created_at -> Int8,
    }
}

diesel::table! {
    users (id) {
        id -> Int4,
        email -> Varchar,
        first_name -> Varchar,
        last_name -> Varchar,
        updated_at -> Int8,
        created_at -> Int8,
        avatar_file_id -> Nullable<Uuid>,
    }
}

diesel::joinable!(assignment_submissions -> assignments (assignment_id));
diesel::joinable!(assignment_submissions -> documents (document_id));
diesel::joinable!(assignment_submissions -> users (user_id));
diesel::joinable!(assignments -> band_scores (band_score_id));
diesel::joinable!(assignments -> documents (document_id));
diesel::joinable!(assignments -> rubrics (grade_by_rubric_id));
diesel::joinable!(band_scores -> organizations (org_id));
diesel::joinable!(document_highlights -> documents (document_id));
diesel::joinable!(document_highlights -> threads (thread_id));
diesel::joinable!(document_highlights -> users (creator_id));
diesel::joinable!(document_page_block_nested_documents -> document_page_blocks (page_block_id));
diesel::joinable!(document_page_block_nested_documents -> documents (document_id));
diesel::joinable!(document_page_blocks -> documents (document_id));
diesel::joinable!(document_template_and_tag -> document_templates (document_template_id));
diesel::joinable!(document_template_and_tag -> tags (tag));
diesel::joinable!(document_template_categories -> organizations (org_id));
diesel::joinable!(document_template_category_tags -> document_template_categories (category_id));
diesel::joinable!(document_template_category_tags -> tags (tag));
diesel::joinable!(document_templates -> documents (document_id));
diesel::joinable!(document_templates -> organizations (org_id));
diesel::joinable!(document_templates -> users (created_by));
diesel::joinable!(document_versions -> documents (versioning_document_id));
diesel::joinable!(document_versions -> users (creator_id));
diesel::joinable!(documents -> files (cover_photo_id));
diesel::joinable!(documents -> organizations (org_id));
diesel::joinable!(documents -> spaces (space_id));
diesel::joinable!(files -> organizations (org_id));
diesel::joinable!(organization_members -> organizations (org_id));
diesel::joinable!(organization_members -> users (user_id));
diesel::joinable!(organizations -> users (owner_id));
diesel::joinable!(quiz_answers -> quizzes (quiz_id));
diesel::joinable!(quiz_answers -> users (user_id));
diesel::joinable!(quiz_structures -> organizations (org_id));
diesel::joinable!(quiz_structures -> users (user_id));
diesel::joinable!(quizzes -> documents (document_id));
diesel::joinable!(quizzes -> quiz_structures (quiz_structure_id));
diesel::joinable!(rubric_submissions -> assignment_submissions (submission_id));
diesel::joinable!(rubric_submissions -> rubrics (rubric_id));
diesel::joinable!(rubrics -> organizations (org_id));
diesel::joinable!(space_members -> spaces (space_id));
diesel::joinable!(space_members -> users (user_id));
diesel::joinable!(spaces -> files (banner_id));
diesel::joinable!(spaces -> organizations (org_id));
diesel::joinable!(spaces -> users (creator_id));
diesel::joinable!(tags -> organizations (org_id));
diesel::joinable!(thread_comments -> files (file_uuid));
diesel::joinable!(thread_comments -> threads (thread_id));
diesel::joinable!(thread_comments -> users (sender_id));
diesel::joinable!(threads -> users (creator_id));

diesel::allow_tables_to_appear_in_same_query!(
    assignment_submissions,
    assignments,
    band_scores,
    document_highlights,
    document_page_block_nested_documents,
    document_page_blocks,
    document_template_and_tag,
    document_template_categories,
    document_template_category_tags,
    document_templates,
    document_versions,
    documents,
    files,
    organization_members,
    organizations,
    quiz_answers,
    quiz_structures,
    quizzes,
    rubric_submissions,
    rubrics,
    space_members,
    spaces,
    tags,
    thread_comments,
    threads,
    users,
);
