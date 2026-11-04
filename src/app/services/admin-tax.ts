
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// =====================================
// TAX RULE
// =====================================

export interface TaxRule {
  taxRuleId: number;

  taxTypeId: number;
  taxCode: string;
  taxName: string;

  ruleName: string;

  calculationType: 'PERCENTAGE' | 'FIXED_AMOUNT';

  calculationBaseId: number | null;
  calculationBaseCode: string | null;
  calculationBaseName: string | null;

  taxValue: number;
  taxPercentage: number | null;

  priority: number;
  isFallback: boolean;
  isActive: boolean;

  conditions: TaxRuleCondition[];
  applicability: TaxRuleApplicability[];
}

// =====================================
// TAX RULE REQUEST
// =====================================

export interface TaxRuleRequest {
  taxTypeId: number;

  ruleName: string;

  calculationType: 'PERCENTAGE' | 'FIXED_AMOUNT';

  calculationBaseId: number | null;

  taxValue: number;

  priority: number;
  isFallback: boolean;
  isActive: boolean;

  conditions: TaxRuleCondition[];
  applicability: TaxRuleApplicability[];
}

// =====================================
// TAX CONDITIONS
// =====================================

export interface TaxRuleCondition {
  fieldName: string;
  operator: string;
  valueFrom: string;
  valueTo: string | null;
}

// =====================================
// TAX APPLICABILITY
// =====================================

export interface TaxRuleApplicability {
  applicabilityType: 'NATIONAL' | 'STATE' | 'CITY' | 'RTO';
  applicabilityCode: string;
}

// =====================================
// TAX CONFIGURATION RESPONSE
// =====================================

export interface TaxConfiguration {
  taxTypes: TaxTypeOption[];
  conditionFields: ConditionFieldOption[];
  calculationBases: CalculationBaseOption[];
}

// =====================================
// TAX TYPE
// =====================================

export interface TaxTypeOption {
  taxTypeId: number;
  taxCode: string;
  taxName: string;
}

// =====================================
// CONDITION FIELD
// =====================================

export interface ConditionFieldOption {
  conditionFieldId: number;
  fieldCode: string;
  fieldLabel: string;
  dataType: string;
  valueSource: string;
  operators: string[];
  availableValues: string[];
}

// =====================================
// CALCULATION BASE
// =====================================

export interface CalculationBaseOption {
  calculationBaseId: number;
  baseCode: string;
  baseName: string;
  description: string;
}

// =====================================
// ADMIN TAX SERVICE
// =====================================

@Injectable({
  providedIn: 'root'
})
export class AdminTaxService {

  private http = inject(HttpClient);

  private readonly baseUrl =
    `${environment.apiBaseUrl}/tax-rules`;

  private readonly configurationUrl =
    `${environment.apiBaseUrl}/tax-configuration`;

  // GET ALL TAX RULES
  getAllRules(): Observable<TaxRule[]> {
    return this.http.get<TaxRule[]>(this.baseUrl);
  }

  // GET TAX RULE BY ID
  getRuleById(id: number): Observable<TaxRule> {
    return this.http.get<TaxRule>(`${this.baseUrl}/${id}`);
  }

  // CREATE TAX RULE
  createRule(data: TaxRuleRequest): Observable<TaxRule> {
    return this.http.post<TaxRule>(this.baseUrl, data);
  }

  // UPDATE TAX RULE
  updateRule(
    id: number,
    data: TaxRuleRequest
  ): Observable<TaxRule> {
    return this.http.put<TaxRule>(
      `${this.baseUrl}/${id}`,
      data
    );
  }

  // DELETE TAX RULE
  deleteRule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // GET TAX CONFIGURATION
  getConfiguration(): Observable<TaxConfiguration> {
    return this.http.get<TaxConfiguration>(
      this.configurationUrl
    );
  }
}
