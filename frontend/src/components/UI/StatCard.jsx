const StatCard = ({ icon: Icon, label, value, tint = 'primary', suffix }) => {
  const tints = {
    primary: 'bg-primary-50 text-primary-600',
    accent: 'bg-accent-500/10 text-accent-600',
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${tints[tint]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-semibold text-ink font-display">{value}{suffix}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;
