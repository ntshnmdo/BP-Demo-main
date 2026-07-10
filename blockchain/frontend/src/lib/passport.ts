import crypto from 'crypto';

const REQUIRED_FIELDS: { [key: string]: 'string' | 'number' | 'boolean' } = {
  // Identity & provenance (fields 1-9)
  adi: 'string',
  battery_serial_number: 'string',
  battery_model: 'string',
  manufacturer_name: 'string',
  manufacturer_id: 'string',
  manufacturing_date: 'string',
  manufacturing_place: 'string',
  battery_category: 'string',
  battery_status: 'string',

  // Physical & electrochemical (fields 10-24)
  battery_weight_kg: 'number',
  chemistry: 'string',
  nominal_voltage_v: 'number',
  nominal_capacity_ah: 'number',
  energy_capacity_kwh: 'number',
  rated_capacity_ah: 'number',
  power_capability_w: 'number',
  internal_resistance_mohm: 'number',
  expected_lifetime_cycles: 'number',
  state_of_health_percent: 'number',
  state_of_charge_percent: 'number',
  depth_of_discharge_percent: 'number',
  temperature_range_min_c: 'number',
  temperature_range_max_c: 'number',
  round_trip_efficiency_percent: 'number',
  capacity_fade_percent: 'number',

  // Materials & sustainability (fields 25-38)
  hazardous_substances: 'string',
  critical_raw_materials: 'string',
  cobalt_percent: 'number',
  lithium_percent: 'number',
  nickel_percent: 'number',
  lead_percent: 'number',
  recycled_cobalt_percent: 'number',
  recycled_lithium_percent: 'number',
  recycled_nickel_percent: 'number',
  recycled_lead_percent: 'number',
  carbon_footprint_kgco2e: 'number',
  carbon_footprint_class: 'string',
  renewable_content_percent: 'number',
  collection_recycling_info: 'string',

  // Compliance & warranty (fields 39-42)
  ce_marking: 'boolean',
  eu_declaration_of_conformity_url: 'string',
  warranty_period_months: 'number',
  ce_certificate_number: 'string'
};

/**
 * Validates the battery passport JSON document strictly.
 * Returns an array of validation error messages, or an empty array if valid.
 */
export function validatePassport(data: any): string[] {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    return ['Invalid document format: Payload must be a JSON object.'];
  }

  // 1. Check all required fields and their types
  for (const [key, type] of Object.entries(REQUIRED_FIELDS)) {
    if (!(key in data)) {
      errors.push(`Missing required field: '${key}'`);
      continue;
    }
    const val = data[key];
    if (typeof val !== type) {
      errors.push(`Incorrect type for field '${key}': Expected ${type}, got ${typeof val}`);
    }
  }

  // 2. Strict check: forbid extra keys (matches extra="forbid" in Pydantic)
  const allowedKeys = new Set(Object.keys(REQUIRED_FIELDS));
  for (const key of Object.keys(data)) {
    if (!allowedKeys.has(key)) {
      errors.push(`Unexpected field: '${key}' is not allowed in the schema.`);
    }
  }

  return errors;
}

/**
 * Deterministic JSON stringify matching Python's canonicalization.
 * Keys are sorted, whitespace is stripped, and values are serialized cleanly.
 */
export function canonicalize(obj: any): string {
  if (obj === null) return 'null';
  if (typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(item => canonicalize(item)).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  const parts = keys.map(key => {
    return JSON.stringify(key) + ':' + canonicalize(obj[key]);
  });
  return '{' + parts.join(',') + '}';
}

/**
 * Generates the lowercase hex SHA-256 fingerprint of the canonical JSON bytes.
 */
export function sha256Hex(data: any): string {
  const canonicalString = canonicalize(data);
  return crypto.createHash('sha256').update(canonicalString, 'utf8').digest('hex');
}
