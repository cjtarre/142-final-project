import { BarChart3 } from "lucide-react";

function ComparisonTable({ metricsEFT, metricsSLF, comparison }) {
  const formatValue = (value) => {
    if (value === null || value === undefined || value === "--") return "--";
    return typeof value === "number" ? value.toFixed(2) : value;
  };

  const formatPercent = (value, prefix = true) => {
    if (value === null || value === undefined || value === "NaN") return "--";
    return prefix ? `+${value}%` : `${value}%`;
  };

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
            <th>Shortest Line First</th>
            <th>EFT Greedy</th>
            <th>Improvement</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Makespan (Total Time)</td>
            <td>{metricsSLF ? formatValue(metricsSLF.makespan) : "--"}</td>
            <td>{metricsEFT ? formatValue(metricsEFT.makespan) : "--"}</td>
            <td>{formatPercent(comparison?.makespanImprovement)}</td>
          </tr>

          <tr>
            <td>Average Wait Time</td>
            <td>{metricsSLF ? formatValue(metricsSLF.averageWaitTime) : "--"}</td>
            <td>{metricsEFT ? formatValue(metricsEFT.averageWaitTime) : "--"}</td>
            <td>{formatPercent(comparison?.waitTimeImprovement)}</td>
          </tr>

          <tr>
            <td>Total Idle Time</td>
            <td>{metricsSLF ? formatValue(metricsSLF.totalIdleTime) : "--"}</td>
            <td>{metricsEFT ? formatValue(metricsEFT.totalIdleTime) : "--"}</td>
            <td>{formatPercent(comparison?.idleTimeReduction, false)}</td>
          </tr>

          <tr>
            <td>System Utilization (%)</td>
            <td>{metricsSLF ? formatValue(metricsSLF.utilization) : "--"}</td>
            <td>{metricsEFT ? formatValue(metricsEFT.utilization) : "--"}</td>
            <td>
              {comparison?.utilizationImprovement
                ? `${comparison.utilizationImprovement}pp`
                : "--"}
            </td>
          </tr>

          <tr>
            <td>Average Queue Length</td>
            <td>{metricsSLF ? formatValue(metricsSLF.averageQueueLength) : "--"}</td>
            <td>{metricsEFT ? formatValue(metricsEFT.averageQueueLength) : "--"}</td>
            <td>--</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}

export default ComparisonTable;