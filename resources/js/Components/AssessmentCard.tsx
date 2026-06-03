import { HealthAssessment } from '@/types';
import Card from '@/Components/ui/Card';
import Chip from '@/Components/ui/Chip';

interface AssessmentCardProps {
    assessment: HealthAssessment;
}

const typeLabels: Record<string, string> = {
    bmi: 'BMI Calculator',
    diabetes_risk: 'Diabetes Risk Screening',
    stress_pss10: 'Stress Level Assessment',
};

const chipVariant: Record<string, 'primary' | 'secondary' | 'tertiary'> = {
    normal: 'primary',
    underweight: 'secondary',
    overweight: 'tertiary',
    obese: 'danger',
    low: 'primary',
    moderate: 'secondary',
    high: 'danger',
};

export default function AssessmentCard({ assessment }: AssessmentCardProps) {
    const label = typeLabels[assessment.type] ?? assessment.type;
    const variant = chipVariant[assessment.category] ?? 'primary';

    return (
        <Card className="flex items-center justify-between">
            <div>
                <h3 className="font-semibold text-on-surface font-[family-name:var(--font-family-heading)]">{label}</h3>
                <p className="text-sm text-on-surface-variant mt-1">{new Date(assessment.taken_at).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
                <p className="text-2xl font-bold text-primary font-[family-name:var(--font-family-heading)]">{assessment.score}</p>
                <Chip variant={variant as any}>{assessment.category}</Chip>
            </div>
        </Card>
    );
}
