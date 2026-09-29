const Spinner = ({ full = false }) => (
  <div className={`flex items-center justify-center ${full ? 'h-64' : 'py-10'}`}>
    <div className="h-8 w-8 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
  </div>
);

export default Spinner;
