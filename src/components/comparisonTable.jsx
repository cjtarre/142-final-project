import { BarChart3 } from "lucide-react";

function ComparisonTable({ avgWaitShortest = 0, avgWaitEFT = 0, improvement = 0, totalIdleShortest = 0, totalIdleEFT = 0 }) {
  return (
    <section className="comparison-table">
      <div className="section-title">
        <BarChart3 size={18} />
        <h2>Performance Comparison</h2>
      </div>

      <table className="metrics-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Shortest Line</th>
            <th>QueueFlow (EFT)</th>
            <th>Improvement</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Average Wait Time (min)</td>
            <td>{avgWaitShortest.toFixed(2)}</td>
            <td>{avgWaitEFT.toFixed(2)}</td>
            <td>{improvement.toFixed(2)}</td>
          </tr>

          <tr>
            <td>Total Idle Time (approx)</td>
            <td>{totalIdleShortest.toFixed(1)}</td>
            <td>{totalIdleEFT.toFixed(1)}</td>
            <td>{(totalIdleShortest - totalIdleEFT).toFixed(1)}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}

export default ComparisonTable;