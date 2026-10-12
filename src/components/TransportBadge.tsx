import React from 'react';
import { Bus, TrainFront, CarTaxiFront, Car, Bike } from 'lucide-react';
import { TransportMode } from '../types';

interface TransportBadgeProps {
  mode: TransportMode;
  vehicleType?: string;
  size?: 'sm' | 'md' | 'lg';
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
          icon: <Bus className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />,
        };
      case 'train':
        return {
          label: 'Train / EMU',
          color: 'text-accent2 border-accent2/30 bg-accent2/10',
          icon: <TrainFront className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />,
        };
      case 'cab':
        return {
          label: 'Cab / Auto',
          color: 'text-yellow border-yellow/30 bg-yellow/10',
          icon: <CarTaxiFront className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />,
        };
      case 'private_vehicle':
        const isBike = vehicleType?.toLowerCase().includes('bike') || vehicleType?.toLowerCase().includes('activa') || vehicleType?.toLowerCase().includes('scooter');
        return {
          label: vehicleType || 'Private Vehicle',
          color: 'text-green border-green/30 bg-green/10',
          icon: isBike ? (
            <Bike className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
          ) : (
            <Car className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
          ),
        };
      default:
        return {
          label: 'Transit',
          color: 'text-muted border-border bg-surface2',
          icon: <Car className="w-4 h-4" />,
        };
    }
  };

  const details = getDetails();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${details.color}`}
    >
      {details.icon}
      {showLabel && <span>{vehicleType || details.label}</span>}
    </span>
  );
}
