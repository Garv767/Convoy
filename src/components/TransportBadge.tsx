import React from 'react';
import { Bus, TrainFront, CarTaxiFront, Car, Bike } from 'lucide-react';
import { TransportMode } from '../types';

interface TransportBadgeProps {
  mode: TransportMode;
  vehicleType?: string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export default function TransportBadge({
  mode,
  vehicleType,
  size = 'md',
  showLabel = true,
}: TransportBadgeProps) {
  const getDetails = () => {
    switch (mode) {
      case 'bus':
        return {
          label: 'Bus',
          color: 'text-accent border-accent/30 bg-accent/10',
          icon: <Bus className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
        };
      case 'train':
        return {
          label: 'Train / EMU',
          color: 'text-accent2 border-accent2/30 bg-accent2/10',
          icon: <TrainFront className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
        };
      case 'cab':
        return {
          label: 'Cab / Auto',
          color: 'text-yellow border-yellow/30 bg-yellow/10',
          icon: <CarTaxiFront className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
        };
      case 'private_vehicle':
        const isBike =
          vehicleType?.toLowerCase().includes('bike') ||
          vehicleType?.toLowerCase().includes('activa') ||
          vehicleType?.toLowerCase().includes('scooter');
        return {
          label: vehicleType || (isBike ? 'Two-Wheeler' : 'Personal Vehicle'),
          color: 'text-green border-green/30 bg-green/10',
          icon: isBike ? (
            <Bike className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          ) : (
            <Car className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          ),
        };
      default:
        return {
          label: 'Transit',
          color: 'text-muted border-border bg-surface2',
          icon: <Car className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
        };
    }
  };

  const details = getDetails();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-medium border ${
        details.color
      } ${
        size === 'sm'
          ? 'px-1.5 py-0.5 text-[11px]'
          : 'px-2 py-0.5 text-xs'
      }`}
    >
      {details.icon}
      {showLabel && <span>{vehicleType || details.label}</span>}
    </span>
  );
}
