import React from 'react';
import { ClientInfo } from '../../types';
import { User, Building, Mail, Phone, MapPin, Hash } from 'lucide-react';

interface Props {
  client: ClientInfo;
  onChange: (client: ClientInfo) => void;
}

export const ClientDetailsSection: React.FC<Props> = ({ client, onChange }) => {
  const handleChange = (field: keyof ClientInfo, value: string) => {
    onChange({
      ...client,
      [field]: value,
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Client / Customer Name *
          </label>
          <div className="relative">
            <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="input-client-name"
              type="text"
              value={client.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Client Company / Organization
          </label>
          <div className="relative">
            <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="input-client-company"
              type="text"
              value={client.company}
              onChange={(e) => handleChange('company', e.target.value)}
              placeholder="e.g. Apex Digital Dynamics Corp."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Client Email
          </label>
          <div className="relative">
            <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="email"
              value={client.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="sarah.j@company.com"
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Client Phone
          </label>
          <div className="relative">
            <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={client.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 234-5678"
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Street Address
          </label>
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={client.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="742 Everglade Commercial Park"
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            City, State, Zip & Country
          </label>
          <input
            type="text"
            value={client.cityStateZip}
            onChange={(e) => handleChange('cityStateZip', e.target.value)}
            placeholder="Austin, TX 78701, USA"
            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Client Tax ID / VAT Number (Optional)
          </label>
          <div className="relative">
            <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={client.taxId || ''}
              onChange={(e) => handleChange('taxId', e.target.value)}
              placeholder="e.g. TX-TAX-449102"
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
