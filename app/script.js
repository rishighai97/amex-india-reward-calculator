class RewardCalculator {
  constructor(totalSpend, shopwiseSpend, mrValue, additionalMR) {
    this.totalSpend = totalSpend || 0;
    this.shopwiseSpend = shopwiseSpend || 0;
    this.mrValue = mrValue || 0.7;
    this.additionalMR = additionalMR || 0;
  }

  compute() {
    const baseMR = this.getBaseMR();
    const accelMR = this.getAcceleratedMR();
    const milestone = this.getMilestoneMR();
    const vouchers = this.getVouchers();
    const yearlyFee = this.getYearlyFees();

    const totalMR = baseMR + accelMR + milestone.totalMR + this.additionalMR;
    const mrValueRs = totalMR * this.mrValue;

    const totalSavings =
      mrValueRs +
      milestone.totalVoucherValue -
      yearlyFee;

    return {
      baseMR,
      accelMR,
      milestone,
      vouchers,
      totalMR,
      mrValueRs,
      totalSavings,
      yearlyFee
    };
  }

  getBaseMR() {}
  getAcceleratedMR() {}
  getMilestoneMR() {}
  getVouchers() {}
  getYearlyFees() {}
}

class PlatinumTravelCalculator extends RewardCalculator {

  getBaseMR() {
    return Math.floor(this.totalSpend / 50);
  }

  getAcceleratedMR() {
    return Math.floor(this.shopwiseSpend / 50) * 2;
  }

  getMilestoneMR() {
    const milestones = {
      190000: 7500,
      400000: 10000,
      700000: 22500
    };

    let totalMR = 0;
    let breakdown = [];

    for (let key in milestones) {
      if (this.totalSpend >= key) {
        totalMR += milestones[key];
        breakdown.push(`₹${key} → ${milestones[key]} MR`);
      }
    }

    return {
      totalMR,
      breakdown,
      totalVoucherValue: this.totalSpend >= 700000 ? 10000 : 0
    };
  }

  getVouchers() {
    return this.totalSpend >= 700000 ? ["₹10,000 Taj Voucher"] : [];
  }

  getYearlyFees() {
    return 5900;
  }
}

// Live Calculation
function calculate() {
  const totalSpend = parseFloat(document.getElementById("totalSpend").value) || 0;
  const shopwiseSpend = parseFloat(document.getElementById("shopwiseSpend").value) || 0;
  const mrValue = parseFloat(document.getElementById("mrValue").value) || 0.7;
  const additionalMR = parseFloat(document.getElementById("additionalMR").value) || 0;

  document.getElementById("spendValue").innerText = totalSpend.toLocaleString();

  const calc = new PlatinumTravelCalculator(
    totalSpend,
    shopwiseSpend,
    mrValue,
    additionalMR
  );

  const r = calc.compute();

  document.getElementById("totalMR").innerText = r.totalMR.toLocaleString();
  document.getElementById("mrValueRs").innerText = "₹" + r.mrValueRs.toFixed(0);
  document.getElementById("totalSavings").innerText = "₹" + r.totalSavings.toFixed(0);

  document.getElementById("breakdown").innerHTML = `
    <b>Total Spend:</b> ₹${totalSpend.toLocaleString()}<br>
    <b>Base MR:</b> ${r.baseMR}<br>
    <b>Accelerated MR:</b> ${r.accelMR}<br>
    <b>Milestone MR:</b> ${r.milestone.totalMR}<br>
    <b>Milestones Hit:</b> ${r.milestone.breakdown.join(", ") || "None"}<br>
    <b>Additional MR:</b> ${additionalMR}<br>
    <b>Vouchers:</b> ${r.vouchers.join(", ") || "None"}<br>
    <b>Yearly Fees:</b> ₹${r.yearlyFee}
  `;
}

// Event listeners for real-time updates
document.querySelectorAll("input").forEach(el => {
  el.addEventListener("input", calculate);
});

calculate();