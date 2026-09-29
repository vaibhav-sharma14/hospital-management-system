const colorMap = {
  active: 'badge-green', completed: 'badge-green', paid: 'badge-green', confirmed: 'badge-green', in_stock: 'badge-green',
  pending: 'badge-amber', scheduled: 'badge-amber', partial: 'badge-amber', low_stock: 'badge-amber', in_progress: 'badge-amber',
  cancelled: 'badge-rose', no_show: 'badge-rose', out_of_stock: 'badge-rose', inactive: 'badge-rose', on_leave: 'badge-rose',
  discharged: 'badge-slate', admitted: 'badge-blue', sample_collected: 'badge-blue',
};

const Badge = ({ status }) => {
  const cls = colorMap[status] || 'badge-slate';
  const label = String(status || '').replace(/_/g, ' ');
  return <span className={cls}>{label}</span>;
};

export default Badge;
