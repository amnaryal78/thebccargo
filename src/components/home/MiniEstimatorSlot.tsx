import React, { useState, useMemo } from 'react';
import { DESTINATIONS } from './route-data';
import { useEstimatorData } from '../../features/estimator/useEstimatorData';
import { calculateEstimate, ShipmentType } from '../../features/estimator/engine';
import { CountrySearchSelect } from '../ui/CountrySearchSelect';
import { Button } from '../../design/primitives/Button';
import { Input } from '../../design/primitives/Input';
import { Counter } from '../../design/primitives/Counter';
import { Spotlight } from '../ui/spotlight';
import { ArrowRight, ShieldCheck, Scale, Zap } from 'lucide-react';

interface MiniEstimatorSlotProps {
  onNavigateToRates: (params?: { dest?: string; weight?: number; type?: ShipmentType }) => void;
}

export const MiniEstimatorSlot: React.FC<MiniEstimatorSlotProps> = ({ onNavigateToRates }) => {
  const [selectedDestId, setSelectedDestId] = useState<string>('dest-dxb');
  const [weightKg, setWeightKg] = useState<number>(10);

  const { sheetRates, internationalRates, handlingRules, rateSettings } = useEstimatorData();

  const availableDestinations = DESTINATIONS;
  const selectedDest = DESTINATIONS.find((d) => d.id === selectedDestId) || availableDestinations[0];

  const destQuery = selectedDest?.code || 'DXB';

  const estimateResult = calculateEstimate(
    {
      type: 'international',
      destination: destQuery,
      actualWeightKg: weightKg,
      mode: 'air',
    },
    { internationalRates, sheetRates },
    handlingRules,
    rateSettings
  );

  const handleDetailedQuote = () => {
    onNavigateToRates({
      dest: selectedDest?.code || 'DXB',
      weight: weightKg,
      type: 'international',
    });
  };

  return (
    <section className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Spotlight
        intensity="strong"
        className="p-6 sm:p-8 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] shadow-hard-md"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Header Info */}
          <div className="lg:col-span-5 flex flex-col gap-3 text-left">
            <div className="inline-flex items-center gap-2 self-start px-2 py-0.5 bg-[var(--surface-muted)] border border-[var(--line)] rounded-[var(--r-xs)] shadow-hard-xs text-[10px] font-mono font-bold uppercase text-[var(--gold-dark)]">
              <Zap className="w-3 h-3" />
              Instant Cargo Calculator
            </div>
            <h3 className="font-heading font-bold text-2xl sm:text-3xl text-[var(--text)] tracking-tight headline-3d">
              Calculate International Cargo Rates
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Transparent rate quotes from Hetauda Central Hub and Nepal to countries worldwide. Live Google Sheet tariffs, box counts, and handling rules applied automatically.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
              <ShieldCheck className="w-4 h-4 text-[var(--green-mid,#16A34A)]" />
              <span>Includes customs declaration assistance &amp; telematics tracking</span>
            </div>
          </div>

          {/* Calculator Inputs & Output Card */}
          <div className="lg:col-span-7 bg-[var(--surface-muted)] p-5 sm:p-6 border border-[var(--line)] rounded-[var(--r-sm)] shadow-hard-xs flex flex-col gap-4">

            {/* Destination & Weight Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <CountrySearchSelect
                  label="Destination Corridor"
                  placeholder="Search destination"
                  options={availableDestinations.map((d) => ({
                    value: d.id,
                    label: `${d.name} (${d.code})`,
                    hint: d.code,
                    flag: d.flag,
                  }))}
                  value={selectedDest?.id || ''}
                  onChange={setSelectedDestId}
                />
              </div>

              <div>
                <Input
                  label="Gross Weight (kg)"
                  type="number"
                  min="0.5"
                  step="0.5"
                  max="1000"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0.5)}
                  className="font-mono text-xs pl-8"
                  leftAdornment={<Scale className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
                />
              </div>
            </div>

            {/* Live Instant Rate Display */}
            <div className="p-3 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-sm)] shadow-hard-xs flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase text-[var(--text-muted)]">
                  Port-to-Door Estimate ({weightKg}kg)
                </div>
                <div className="font-heading font-extrabold text-xl text-[var(--oxford-deep)]">
                  {estimateResult?.allowed ? (
                    <Counter
                      to={estimateResult.breakdown.totalNpr}
                      prefix="NPR "
                      duration={600}
                    />
                  ) : (
                    'Custom Quote'
                  )}
                </div>
                {estimateResult?.allowed && (
                  <div className="text-[10px] font-mono text-[var(--text-muted)]">
                    ≈ ${estimateResult.breakdown.totalUsd} USD
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono uppercase text-[var(--text-muted)]">
                  Est. Delivery Time
                </div>
                <div className="font-mono text-xs font-bold text-[var(--text)]">
                  {selectedDest?.transitTime || '3 - 5 Days'}
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <Button
              variant="primary"
              className="w-full text-xs font-semibold whitespace-nowrap"
              onClick={handleDetailedQuote}
              rightIcon={<ArrowRight className="w-3.5 h-3.5 shrink-0" />}
            >
              Price
            </Button>

          </div>

        </div>
      </Spotlight>
    </section>
  );
};
