'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useUpdateRecord } from '@/hooks/useRecords';
import type { StudentContextRecord } from '@/types/record';

const EditSchema = z.object({
  satScore: z.coerce.number().int().min(400).max(1600).nullable().optional(),
  neetScore: z.coerce.number().min(0).nullable().optional(),
  jeeScore: z.coerce.number().min(0).nullable().optional(),
  studentProfileScore: z.coerce.number().min(0).max(100).nullable().optional(),
  courseInterest: z.string().max(255).nullable().optional(),
  preferredCountry: z.string().max(100).nullable().optional(),
  preferredState: z.string().max(100).nullable().optional(),
  budgetRange: z.string().max(100).nullable().optional(),
  sopStrength: z.coerce.number().min(0).max(10).nullable().optional(),
  lorStrength: z.coerce.number().min(0).max(10).nullable().optional(),
  profileRating: z.coerce.number().min(1).max(10).nullable().optional(),
  targetCollegeRank: z.coerce.number().int().min(1).nullable().optional(),
  recommendedCollege: z.string().max(500).nullable().optional(),
  recommendedCourse: z.string().max(255).nullable().optional(),
});

type EditFormData = z.infer<typeof EditSchema>;

interface EditRecordModalProps {
  record: StudentContextRecord;
  onClose: () => void;
}

const FIELD_LABELS: Record<keyof EditFormData, string> = {
  satScore: 'SAT Score (400–1600)',
  neetScore: 'NEET Score',
  jeeScore: 'JEE Score',
  studentProfileScore: 'Profile Score (0–100)',
  courseInterest: 'Course Interest',
  preferredCountry: 'Preferred Country',
  preferredState: 'Preferred State',
  budgetRange: 'Budget Range',
  sopStrength: 'SOP Strength (0–10)',
  lorStrength: 'LOR Strength (0–10)',
  profileRating: 'Profile Rating (1–10)',
  targetCollegeRank: 'Target College Rank',
  recommendedCollege: 'Recommended College',
  recommendedCourse: 'Recommended Course',
};

export function EditRecordModal({ record, onClose }: EditRecordModalProps) {
  const { mutate: updateRecord, isPending, isError, error } = useUpdateRecord();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(EditSchema),
    defaultValues: {
      satScore: record.satScore ?? undefined,
      neetScore: record.neetScore ?? undefined,
      jeeScore: record.jeeScore ?? undefined,
      studentProfileScore: record.studentProfileScore ?? undefined,
      courseInterest: record.courseInterest ?? undefined,
      preferredCountry: record.preferredCountry ?? undefined,
      preferredState: record.preferredState ?? undefined,
      budgetRange: record.budgetRange ?? undefined,
      sopStrength: record.sopStrength ?? undefined,
      lorStrength: record.lorStrength ?? undefined,
      profileRating: record.profileRating ?? undefined,
      targetCollegeRank: record.targetCollegeRank ?? undefined,
      recommendedCollege: record.recommendedCollege ?? undefined,
      recommendedCourse: record.recommendedCourse ?? undefined,
    },
  });

  const onSubmit = (data: EditFormData) => {
    updateRecord(
      { id: record.id, data },
      { onSuccess: onClose }
    );
  };

  const numericFields: (keyof EditFormData)[] = [
    'satScore', 'neetScore', 'jeeScore', 'studentProfileScore',
    'sopStrength', 'lorStrength', 'profileRating', 'targetCollegeRank',
  ];
  const stringFields: (keyof EditFormData)[] = [
    'courseInterest', 'preferredCountry', 'preferredState',
    'budgetRange', 'recommendedCollege', 'recommendedCourse',
  ];

  return (
    <Modal open onClose={onClose} title="Edit Record" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {isError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {(error as Error)?.message || 'Failed to update record'}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {numericFields.map((field) => (
            <Input
              key={field}
              id={field}
              label={FIELD_LABELS[field]}
              type="number"
              step="any"
              placeholder="—"
              error={(errors[field] as { message?: string })?.message}
              {...register(field)}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {stringFields.map((field) => (
            <Input
              key={field}
              id={field}
              label={FIELD_LABELS[field]}
              type="text"
              placeholder="—"
              error={(errors[field] as { message?: string })?.message}
              {...register(field)}
            />
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={isPending} className="flex-1">
            Save Changes
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
