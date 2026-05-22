import { BarChart3 } from "lucide-react";

function ComparisonTable() {
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
            <th>EFT Greedy</th>
            <th>Improvement</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Average Wait Time</td>
            <td>--</td>
            <td>--</td>
            <td>--</td>
          </tr>

          <tr>
            <td>Makespan</td>
            <td>--</td>
            <td>--</td>
            <td>--</td>
          </tr>

          <tr>
            <td>Total Idle Time</td>
            <td>--</td>
            <td>--</td>
            <td>--</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}

export default ComparisonTable;