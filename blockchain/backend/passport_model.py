"""
passport_model.py
=================

Strict Pydantic (v2) schema for the 42-field EU-style Battery Passport document,
plus the deterministic canonicalization + SHA-256 hashing used across the whole
anchoring pipeline.

Why canonicalization matters
----------------------------
The on-chain hash is only meaningful if EVERY actor (frontend, backend, verifier)
serializes the JSON the exact same way. Two byte-identical documents must produce
the same hash; two logically-identical-but-differently-ordered documents must ALSO
produce the same hash. We guarantee that by:

    - sorting keys alphabetically              (order independence)
    - stripping all insignificant whitespace   (formatting independence)
    - using UTF-8 with ensure_ascii=False       (stable byte representation)

The resulting bytes are what we (a) SHA-256 and (b) pin to IPFS, so the CID and the
hash describe the identical byte stream.
"""

from __future__ import annotations

import hashlib
import json
from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class BatteryPassport(BaseModel):
    """
    The canonical 42-field Battery Passport record.

    `model_config` with extra="forbid" makes the schema STRICT: any unexpected key
    in the incoming JSON raises a ValidationError. Combined with all fields being
    required (no defaults), this enforces that all 42 fields are present and typed.
    """

    model_config = ConfigDict(extra="forbid", frozen=True)

    # --- 1. Identity & provenance (fields 1-9) ---------------------------- #
    adi: str = Field(..., description="Accumulate Digital Identifier, e.g. adi://ev.acme/battery/SN123")
    battery_serial_number: str = Field(..., description="Unique physical serial number")
    battery_model: str = Field(..., description="Commercial model / part number")
    manufacturer_name: str = Field(..., description="Legal manufacturer name")
    manufacturer_id: str = Field(..., description="Manufacturer registration id (e.g. EORI)")
    manufacturing_date: date = Field(..., description="Date of manufacture (ISO-8601)")
    manufacturing_place: str = Field(..., description="Facility / country of manufacture")
    battery_category: str = Field(..., description="EV | industrial | LMT | portable | SLI")
    battery_status: str = Field(..., description="original | repurposed | reused | recycled | waste")

    # --- 2. Physical & electrochemical (fields 10-24) --------------------- #
    battery_weight_kg: float = Field(..., ge=0)
    chemistry: str = Field(..., description="Cell chemistry, e.g. NMC-811, LFP")
    nominal_voltage_v: float = Field(..., ge=0)
    nominal_capacity_ah: float = Field(..., ge=0)
    energy_capacity_kwh: float = Field(..., ge=0)
    rated_capacity_ah: float = Field(..., ge=0)
    power_capability_w: float = Field(..., ge=0)
    internal_resistance_mohm: float = Field(..., ge=0)
    expected_lifetime_cycles: int = Field(..., ge=0)
    state_of_health_percent: float = Field(..., ge=0, le=100)
    state_of_charge_percent: float = Field(..., ge=0, le=100)
    depth_of_discharge_percent: float = Field(..., ge=0, le=100)
    temperature_range_min_c: float = Field(...)
    temperature_range_max_c: float = Field(...)
    round_trip_efficiency_percent: float = Field(..., ge=0, le=100)
    capacity_fade_percent: float = Field(..., ge=0, le=100)

    # --- 3. Materials & sustainability (fields 25-38) --------------------- #
    hazardous_substances: str = Field(..., description="Declared hazardous substances summary")
    critical_raw_materials: str = Field(..., description="Declared CRMs summary")
    cobalt_percent: float = Field(..., ge=0, le=100)
    lithium_percent: float = Field(..., ge=0, le=100)
    nickel_percent: float = Field(..., ge=0, le=100)
    lead_percent: float = Field(..., ge=0, le=100)
    recycled_cobalt_percent: float = Field(..., ge=0, le=100)
    recycled_lithium_percent: float = Field(..., ge=0, le=100)
    recycled_nickel_percent: float = Field(..., ge=0, le=100)
    recycled_lead_percent: float = Field(..., ge=0, le=100)
    carbon_footprint_kgco2e: float = Field(..., ge=0)
    carbon_footprint_class: str = Field(..., description="Performance class A-G")
    renewable_content_percent: float = Field(..., ge=0, le=100)
    collection_recycling_info: str = Field(..., description="End-of-life collection instructions")

    # --- 4. Compliance & warranty (fields 39-42) -------------------------- #
    ce_marking: bool = Field(..., description="CE conformity marking present")
    eu_declaration_of_conformity_url: str = Field(..., description="URL to EU DoC")
    warranty_period_months: int = Field(..., ge=0)
    ce_certificate_number: str = Field(..., description="CE / notified-body certificate id")

    # ------------------------------------------------------------------ #
    #                     Canonicalization + hashing                     #
    # ------------------------------------------------------------------ #

    def canonical_bytes(self) -> bytes:
        """
        Deterministic UTF-8 byte representation of this passport.

        These are the EXACT bytes that get (a) hashed and (b) pinned to IPFS,
        guaranteeing the on-chain hash and the CID describe the same content.

        `mode="json"` renders dates/enums as JSON-native strings; `sort_keys` +
        the tight separators remove ordering and whitespace ambiguity.
        """
        # model_dump(mode="json") -> plain dict with JSON-serializable scalars.
        plain = self.model_dump(mode="json")
        return canonicalize(plain)

    def sha256_hex(self) -> str:
        """Lowercase hex SHA-256 of the canonical bytes (matches the Solidity anchor)."""
        return hashlib.sha256(self.canonical_bytes()).hexdigest()


def canonicalize(document: dict) -> bytes:
    """
    Standalone canonicalizer so the verifier can hash a raw DB dict without
    necessarily re-validating it through the Pydantic model.

    sort_keys=True             -> alphabetical key ordering (order independence)
    separators=(",", ":")      -> no whitespace between tokens
    ensure_ascii=False         -> stable UTF-8 (don't escape non-ASCII into \\uXXXX)
    """
    return json.dumps(
        document,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
    ).encode("utf-8")


def sha256_hex(document: dict) -> str:
    """Convenience: canonicalize + SHA-256 a raw dict, returning lowercase hex."""
    return hashlib.sha256(canonicalize(document)).hexdigest()
