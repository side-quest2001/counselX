-- CreateEnum
CREATE TYPE "RecommendationCategory" AS ENUM ('SAFE', 'TARGET', 'AMBITIOUS');

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "country" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_profiles" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "sat_score" INTEGER,
    "jee_rank" INTEGER,
    "neet_score" DOUBLE PRECISION,
    "gpa" DOUBLE PRECISION,
    "sop_strength" DOUBLE PRECISION,
    "lor_strength" DOUBLE PRECISION,
    "extracurricular_score" DOUBLE PRECISION,
    "preferred_country" TEXT,
    "budget" DOUBLE PRECISION,
    "target_major" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" TEXT NOT NULL,
    "student_profile_id" TEXT NOT NULL,
    "university_name" TEXT NOT NULL,
    "category" "RecommendationCategory" NOT NULL,
    "confidence_score" DOUBLE PRECISION NOT NULL,
    "similar_profiles_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "students_email_key" ON "students"("email");

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_student_profile_id_fkey" FOREIGN KEY ("student_profile_id") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
