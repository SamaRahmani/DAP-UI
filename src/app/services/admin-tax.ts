
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../core/config/api.config';

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

export interface TaxRuleCondition {
  fieldName: string;
  operator: string;
  valueFrom: string;
  valueTo: string | null;
}

export interface TaxRuleApplicability {
  applicabilityType: 'NATIONAL' | 'STATE' | 'CITY' | 'RTO';
  applicabilityCode: string;
}

export interface TaxConfiguration {
  taxTypes: TaxTypeOption[];
  conditionFields: ConditionFieldOption[];
  calculationBases: CalculationBaseOption[];
}

export interface TaxTypeOption {
  taxTypeId: number;
  taxCode: string;
  taxName: string;
}

export interface ConditionFieldOption {
  conditionFieldId: number;
  fieldCode: string;
  fieldLabel: string;
  dataType: string;
  valueSource: string;
  operators: string[];
  availableValues: string[];
}

export interface CalculationBaseOption {
  calculationBaseId: number;
  baseCode: string;
  baseName: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminTaxService {

  private readonly http = inject(HttpClient);

  private readonly baseUrl = `${API_CONFIG.adminUrl}/tax-rules`;

  private readonly configurationUrl =
    `${API_CONFIG.adminUrl}/tax-configuration`;

  getAllRules(): Observable<TaxRule[]> {
    return this.http.get<TaxRule[]>(this.baseUrl);
  }

  getRuleById(id: number): Observable<TaxRule> {
    return this.http.get<TaxRule>(`${this.baseUrl}/${id}`);
  }

  createRule(data: TaxRuleRequest): Observable<TaxRule> {
    return this.http.post<TaxRule>(this.baseUrl, data);
  }

  updateRule(id: number, data: TaxRuleRequest): Observable<TaxRule> {
    return this.http.put<TaxRule>(
      `${this.baseUrl}/${id}`,
      data
    );
  }

  deleteRule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getConfiguration(): Observable<TaxConfiguration> {
    return this.http.get<TaxConfiguration>(this.configurationUrl);
  }
}
