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
          color: 'text-blue-400 border-blue-500/25 bg-blue-500/10',
          icon: <Bus className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
        };
      case 'train':
        return {
          label: 'Train / EMU',
          color: 'text-sky-400 border-sky-500/25 bg-sky-500/10',
          icon: <TrainFront className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
        };
      case 'cab':
        return {
          label: 'Cab / Auto',
          color: 'text-[#FBC02D] border-[#FBC02D]/30 bg-[#FBC02D]/10',
          icon: <CarTaxiFront className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
        };
      case 'private_vehicle':
        const isBike =
          vehicleType?.toLowerCase().includes('bike') ||
          vehicleType?.toLowerCase().includes('activa') ||
          vehicleType?.toLowerCase().includes('scooter');
        return {
          label: vehicleType || (isBike ? 'Two-Wheeler' : 'Personal Vehicle'),
          color: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/10',
          icon: isBike ? (
            <Bike className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          ) : (
            <Car className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          ),
        };
      default:
        return {
          label: 'Transit',
          color: 'text-gray-400 border-white/10 bg-white/5',
          icon: <Car className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
        };
    }
  };

  const details = getDetails();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${
        details.color
      } ${
        size === 'sm'
          ? 'px-2 py-0.5 text-[11px]'
          : 'px-2.5 py-1 text-xs'
      }`}
    >
      {details.icon}
      {showLabel && <span>{vehicleType || details.label}</span>}
    </span>
  );
}
