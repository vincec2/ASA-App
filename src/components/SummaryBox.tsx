type SummaryBoxProps = {
  label: string;
  value: number;
};

function SummaryBox({ label, value }: SummaryBoxProps) {
  return (
    <div className="summary-box">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default SummaryBox;