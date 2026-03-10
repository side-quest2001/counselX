-- CreateEnum
CREATE TYPE "DatasetStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "datasets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "source" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "row_count" INTEGER NOT NULL DEFAULT 0,
    "status" "DatasetStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "datasets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_context_records" (
    "id" TEXT NOT NULL,
    "dataset_id" TEXT NOT NULL,
    "student_profile_score" DOUBLE PRECISION,
    "sat_score" INTEGER,
    "neet_score" DOUBLE PRECISION,
    "jee_score" DOUBLE PRECISION,
    "course_interest" TEXT,
    "preferred_country" TEXT,
    "preferred_state" TEXT,
    "budget_range" TEXT,
    "sop_strength" DOUBLE PRECISION,
    "lor_strength" DOUBLE PRECISION,
    "profile_rating" DOUBLE PRECISION,
    "target_college_rank" INTEGER,
    "recommended_college" TEXT,
    "recommended_course" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_context_records_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "student_context_records" ADD CONSTRAINT "student_context_records_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "datasets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
