
import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  AdminTaxService,
  TaxRule,
  TaxRuleRequest,
  TaxRuleCondition,
  TaxRuleApplicability,
  TaxConfiguration,
  ConditionFieldOption,
  TaxTypeOption,
  CalculationBaseOption
} from '../../services/admin-tax';

type CalculationType = 'PERCENTAGE' | 'FIXED_AMOUNT';

@Component({
  selector: 'app-taxes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './taxes.html',
  styleUrl: './taxes.css'
})
export class Taxes implements OnInit {

  private taxService = inject(AdminTaxService);
  private cdr = inject(ChangeDetectorRef);

  // =====================================
  // DATA
  // =====================================

  taxRules: TaxRule[] = [];

  taxTypes: TaxTypeOption[] = [];
  conditionFields: ConditionFieldOption[] = [];
  calculationBases: CalculationBaseOption[] = [];

  // =====================================
  // LOADING AND MESSAGES
  // =====================================

  isLoading = false;
  isSaving = false;

  errorMessage = '';
  successMessage = '';

  // =====================================
  // SEARCH
  // =====================================

  searchTerm = '';

  get filteredRules(): TaxRule[] {
    const search = this.searchTerm.trim().toLowerCase();

    if (!search) {
      return this.taxRules;
    }

    return this.taxRules.filter(rule =>
      rule.taxName?.toLowerCase().includes(search) ||
      rule.taxCode?.toLowerCase().includes(search) ||
      rule.ruleName?.toLowerCase().includes(search) ||
      rule.calculationType?.toLowerCase().includes(search)
    );
  }

  // =====================================
  // MODALS
  // =====================================

  showFormModal = false;
  showDeleteModal = false;

  isEditMode = false;

  selectedRule: TaxRule | null = null;
  ruleToDelete: TaxRule | null = null;

  // =====================================
  // TAX RULE FORM
  // =====================================

  form: TaxRuleRequest = this.createEmptyForm();

  private createEmptyForm(): TaxRuleRequest {
    return {
      taxTypeId: 0,
      ruleName: '',
      calculationType: 'PERCENTAGE',
      calculationBaseId: null,
      taxValue: 0,
      priority: 100,
      isFallback: false,
      isActive: true,
      conditions: [],
      applicability: [
        {
          applicabilityType: 'NATIONAL',
          applicabilityCode: 'ALL'
        }
      ]
    };
  }

  // =====================================
  // INITIALIZATION
  // =====================================

  ngOnInit(): void {
    this.loadConfiguration();
    this.loadRules();
  }

  // =====================================
  // LOAD CONFIGURATION
  // =====================================

  loadConfiguration(): void {
    this.taxService.getConfiguration().subscribe({
      next: (response: TaxConfiguration) => {
        this.taxTypes = response.taxTypes ?? [];
        this.conditionFields = response.conditionFields ?? [];
        this.calculationBases = response.calculationBases ?? [];

        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = this.getErrorMessage(
          error,
          'Unable to load tax configuration.'
        );

        this.cdr.detectChanges();
      }
    });
  }

  // =====================================
  // LOAD TAX RULES
  // =====================================

  loadRules(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.taxService.getAllRules().subscribe({
      next: (response) => {
        this.taxRules = response ?? [];
        this.isLoading = false;

        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;

        this.errorMessage = this.getErrorMessage(
          error,
          'Unable to load tax rules.'
        );

        this.cdr.detectChanges();
      }
    });
  }

  // =====================================
  // OPEN CREATE MODAL
  // =====================================

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedRule = null;

    this.form = this.createEmptyForm();

    this.errorMessage = '';
    this.successMessage = '';

    this.showFormModal = true;
  }

  // =====================================
  // OPEN EDIT MODAL
  // =====================================

  openEditModal(rule: TaxRule): void {
    this.isEditMode = true;
    this.selectedRule = rule;

    this.form = {
      taxTypeId: rule.taxTypeId,
      ruleName: rule.ruleName,

      calculationType: rule.calculationType,
      calculationBaseId: rule.calculationBaseId,

      taxValue: rule.taxValue,

      priority: rule.priority,
      isFallback: rule.isFallback,
      isActive: rule.isActive,

      conditions: (rule.conditions ?? []).map(condition => ({
        fieldName: condition.fieldName,
        operator: condition.operator,
        valueFrom: condition.valueFrom,
        valueTo: condition.valueTo
      })),

      applicability: (rule.applicability ?? []).map(item => ({
        applicabilityType: item.applicabilityType as TaxRuleApplicability['applicabilityType'],
        applicabilityCode: item.applicabilityCode
      }))
    };

    this.errorMessage = '';
    this.successMessage = '';

    this.showFormModal = true;
  }

  // =====================================
  // CLOSE FORM MODAL
  // =====================================

  closeFormModal(): void {
    if (this.isSaving) {
      return;
    }

    this.showFormModal = false;
    this.selectedRule = null;
    this.errorMessage = '';
  }

  // =====================================
  // CALCULATION TYPE
  // =====================================

  onCalculationTypeChange(): void {
    if (this.form.calculationType === 'FIXED_AMOUNT') {
      this.form.calculationBaseId = null;
    }
  }

  // =====================================
  // CONDITIONS
  // =====================================

  addCondition(): void {
    this.form.conditions.push({
      fieldName: '',
      operator: '',
      valueFrom: '',
      valueTo: null
    });
  }

  removeCondition(index: number): void {
    this.form.conditions.splice(index, 1);
  }

  onConditionFieldChange(index: number): void {
    const condition = this.form.conditions[index];

    condition.operator = '';
    condition.valueFrom = '';
    condition.valueTo = null;
  }

  getOperators(fieldName: string): string[] {
    const field = this.conditionFields.find(
      item => item.fieldCode === fieldName
    );

    return field?.operators ?? [];
  }

  getConditionField(fieldName: string): ConditionFieldOption | undefined {
    return this.conditionFields.find(
      item => item.fieldCode === fieldName
    );
  }

  isBetweenOperator(operator: string): boolean {
    return operator === 'BETWEEN';
  }

  // =====================================
  // APPLICABILITY
  // =====================================

  addApplicability(): void {
    const currentType =
      this.form.applicability[0]?.applicabilityType ?? 'NATIONAL';

    this.form.applicability.push({
      applicabilityType: currentType,
      applicabilityCode: currentType === 'NATIONAL' ? 'ALL' : ''
    });
  }

  removeApplicability(index: number): void {
    this.form.applicability.splice(index, 1);
  }

  onApplicabilityTypeChange(index: number): void {
    const item = this.form.applicability[index];

    // All applicability entries in one rule must use
    // the same geographical level.
    this.form.applicability = this.form.applicability.map(
      (_, currentIndex) => ({
        applicabilityType: item.applicabilityType,
        applicabilityCode:
          currentIndex === index && item.applicabilityType === 'NATIONAL'
            ? 'ALL'
            : ''
      })
    );
  }

  // =====================================
  // SAVE TAX RULE
  // =====================================

  saveRule(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const validationError = this.validateForm();

    if (validationError) {
      this.errorMessage = validationError;
      return;
    }

    const request: TaxRuleRequest = {
      ...this.form,

      ruleName: this.form.ruleName.trim(),

      calculationBaseId:
        this.form.calculationType === 'FIXED_AMOUNT'
          ? null
          : this.form.calculationBaseId,

      taxValue: Number(this.form.taxValue),
      priority: Number(this.form.priority),

      conditions: this.form.conditions.map(condition => ({
        fieldName: condition.fieldName,
        operator: condition.operator,
        valueFrom: condition.valueFrom.trim(),
        valueTo:
          condition.operator === 'BETWEEN'
            ? condition.valueTo?.trim() ?? null
            : null
      })),

      applicability: this.form.applicability.map(item => ({
        applicabilityType: item.applicabilityType,
        applicabilityCode: item.applicabilityCode.trim()
      }))
    };

    this.isSaving = true;

    const request$ = this.isEditMode && this.selectedRule
      ? this.taxService.updateRule(this.selectedRule.taxRuleId, request)
      : this.taxService.createRule(request);

    request$.subscribe({
      next: () => {
        this.isSaving = false;
        this.showFormModal = false;

        this.successMessage = this.isEditMode
          ? 'Tax rule updated successfully.'
          : 'Tax rule created successfully.';

        this.loadRules();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isSaving = false;

        this.errorMessage = this.getErrorMessage(
          error,
          'Unable to save tax rule.'
        );

        this.cdr.detectChanges();
      }
    });
  }

  // =====================================
  // FORM VALIDATION
  // =====================================

  private validateForm(): string | null {

    if (!this.form.taxTypeId) {
      return 'Please select a tax type.';
    }

    if (!this.form.ruleName.trim()) {
      return 'Please enter a rule name.';
    }

    if (
      !this.form.calculationType ||
      !['PERCENTAGE', 'FIXED_AMOUNT'].includes(this.form.calculationType)
    ) {
      return 'Please select a valid calculation type.';
    }

    if (
      this.form.calculationType === 'PERCENTAGE' &&
      !this.form.calculationBaseId
    ) {
      return 'Please select a calculation base for percentage tax.';
    }

    if (
      this.form.taxValue === null ||
      this.form.taxValue === undefined ||
      Number(this.form.taxValue) < 0
    ) {
      return 'Tax value cannot be negative.';
    }

    if (
      this.form.calculationType === 'PERCENTAGE' &&
      Number(this.form.taxValue) > 100
    ) {
      return 'Percentage tax value cannot exceed 100.';
    }

    if (!Number.isInteger(Number(this.form.priority)) ||
        Number(this.form.priority) < 1) {
      return 'Priority must be a positive integer.';
    }

    // Validate conditions
    for (const condition of this.form.conditions) {

      if (!condition.fieldName) {
        return 'Please select a condition field.';
      }

      if (!condition.operator) {
        return 'Please select a condition operator.';
      }

      if (!condition.valueFrom?.trim()) {
        return 'Please enter a condition value.';
      }

      if (
        condition.operator === 'BETWEEN' &&
        !condition.valueTo?.trim()
      ) {
        return 'Please enter the upper value for BETWEEN.';
      }
    }

    // Validate geographical applicability
    if (!this.form.applicability.length) {
      return 'At least one geographical applicability is required.';
    }

    const applicabilityType =
      this.form.applicability[0].applicabilityType;

    for (const item of this.form.applicability) {

      if (!item.applicabilityCode.trim()) {
        return 'Please enter an applicability code.';
      }

      if (item.applicabilityType !== applicabilityType) {
        return 'All applicability entries must use the same geographical level.';
      }
    }

    return null;
  }

  // =====================================
  // DELETE TAX RULE
  // =====================================

  openDeleteModal(rule: TaxRule): void {
    this.ruleToDelete = rule;
    this.showDeleteModal = true;
    this.errorMessage = '';
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.ruleToDelete = null;
  }

  confirmDelete(): void {
    if (!this.ruleToDelete) {
      return;
    }

    const id = this.ruleToDelete.taxRuleId;

    this.taxService.deleteRule(id).subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.ruleToDelete = null;

        this.successMessage = 'Tax rule deleted successfully.';

        this.loadRules();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = this.getErrorMessage(
          error,
          'Unable to delete tax rule.'
        );

        this.cdr.detectChanges();
      }
    });
  }

  // =====================================
  // DISPLAY HELPERS
  // =====================================

  getCalculationLabel(type: string): string {
    return type === 'FIXED_AMOUNT'
      ? 'Fixed Amount'
      : 'Percentage';
  }

  getApplicabilityLabel(type: string): string {
    const labels: Record<string, string> = {
      NATIONAL: 'National',
      STATE: 'State',
      CITY: 'City',
      RTO: 'RTO'
    };

    return labels[type] ?? type;
  }

  // =====================================
  // ERROR HANDLING
  // =====================================

  private getErrorMessage(error: any, fallback: string): string {
    return error?.error?.message ||
      error?.error?.error ||
      error?.message ||
      fallback;
  }
}
