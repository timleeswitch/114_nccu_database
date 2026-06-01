export type Program = 'bachelor' | 'master' | 'doctoral';

export interface GraduationRule {
  rule_id: number;
  admission_year: number;
  department: string;
  program: Program;
  total_required_credits: number;
}
