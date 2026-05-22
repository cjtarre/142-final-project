# Checkout Lanes Optimizer (Simulator)

**Course:** CMSC 142 – Design and Analysis of Algorithms

**Group Members:**
- Ma. Christie Jude L. Tarre
- Gabrielle Sumergido
- Arellano

---

## Project Overview

Retail checkout systems often suffer from inefficient customer distribution, leading to long queues, overloaded cashiers, and increased waiting times.

Traditional heuristics such as selecting the shortest line do not account for important factors such as cashier processing speed and customer item load.

This project models a checkout environment where multiple lanes operate with different cashier speeds, and customers arrive with varying numbers of items. The simulator is designed to compare traditional queue assignment strategies with a more efficient scheduling-based approach.

The goal is to minimize queue congestion, reduce customer waiting time, and improve checkout resource utilization.

---

## Proposed Algorithm

This project is designed around the **Earliest Finish Time (EFT) Greedy Algorithm**.

For every incoming customer, the projected finish time for each checkout lane is computed using:

```text
Projected Finish Time = Current Lane Finish Time + (Customer Items / Cashier Speed)
```

The customer is then assigned to the lane with the smallest projected finish time.

This approach considers:

- current lane workload
- cashier processing speed
- incoming customer item count

Unlike the traditional shortest-line heuristic, this strategy evaluates actual processing efficiency rather than simply queue length.

---

## Current Features

The current implementation includes:

- Interactive React-based web interface
- Dynamic lane count selection
- Cashier speed input configuration
- Customer item input
- Start, pause, and reset simulation controls
- Customer queue visualization
- Input validation
- Performance comparison dashboard layout
- Algorithm overview panel

---

## Planned Features

The following features are planned for final implementation:

- Full Earliest Finish Time (EFT) Greedy algorithm integration
- Real-time lane assignment using projected finish times
- Shortest Line vs. EFT Greedy strategy comparison
- Average waiting time computation
- Makespan calculation
- Total idle time tracking
- Simulation analytics and performance reporting

---

## Tech Stack

- React
- Vite
- JavaScript
- CSS
- Lucide React

---

## How to Run

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/checkout-lanes-optimizer.git
```

Navigate into the project folder:

```bash
cd checkout-lanes-optimizer
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open the local development link provided in the terminal.