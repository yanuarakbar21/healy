export interface HealthAssessment {
    id: string;
    type: 'bmi' | 'diabetes_risk' | 'stress_pss10';
    score: number;
    category: string;
    responses: Record<string, any>;
    recommendation?: string;
    taken_at: string;
}

export interface UserProfile {
    id: string;
    full_name: string;
    birth_date: string;
    gender: string;
    height_cm: number | null;
    weight_kg: number | null;
    allergies: string | null;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    created_at: string;
}
