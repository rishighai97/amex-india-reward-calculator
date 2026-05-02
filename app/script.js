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

  const savingsPercentage = totalSpend > 0 ? ((r.totalSavings / totalSpend) * 100).toFixed(1) : "0";
  document.getElementById("savingsPercentage").innerText = `${savingsPercentage}%`;

  // Reward Breakdown Cards
  document.getElementById("baseMRCard").innerText = r.baseMR.toLocaleString();
  document.getElementById("accelMRCard").innerText = r.accelMR.toLocaleString();
  document.getElementById("additionalMRCard").innerText = additionalMR.toLocaleString();
  document.getElementById("milestoneMRCard").innerText = r.milestone.totalMR.toLocaleString();
  document.getElementById("vouchersCard").innerText = "₹" + r.milestone.totalVoucherValue.toLocaleString();

  // Earnings Breakdown
  document.getElementById("earningsBreakdown").innerHTML = `
    <div><b>(MR ₹ Value) + Vouchers - Yearly Fees</b></div>
    <div>(₹${r.mrValueRs.toFixed(0)}) + ₹${r.milestone.totalVoucherValue} - ₹${r.yearlyFee} = <b>₹${r.totalSavings.toFixed(0)}</b></div>
  `;

  // Milestones Hit
  let milestonesContent = '';
  if (r.milestone.breakdown.length > 0) {
    milestonesContent += r.milestone.breakdown.map(m => `<div>✓ ${m}</div>`).join('');
  }
  if (r.vouchers.length > 0) {
    milestonesContent += r.vouchers.map(v => `<div>✓ Voucher: ${v}</div>`).join('');
  }
  if (milestonesContent === '') {
    milestonesContent = '<div>No milestones hit</div>';
  }
  document.getElementById("milestonesHit").innerHTML = milestonesContent;
}

// Sync shopwise slider max value with total spend
const totalSpendSlider = document.getElementById("totalSpend");
const shopwiseSlider = document.getElementById("shopwiseSpend");

totalSpendSlider.addEventListener("input", () => {
  const totalSpend = parseFloat(totalSpendSlider.value) || 0;
  shopwiseSlider.max = totalSpend;

  // Cap shopwise spend if it exceeds new max
  if (parseFloat(shopwiseSlider.value) > totalSpend) {
    shopwiseSlider.value = totalSpend;
  }

  calculate();
});

shopwiseSlider.addEventListener("input", () => {
  const shopwiseSpend = parseFloat(shopwiseSlider.value) || 0;
  document.getElementById("shopwiseValue").innerText = shopwiseSpend.toLocaleString();
  calculate();
});

document.getElementById("mrValue").addEventListener("input", calculate);
document.getElementById("additionalMR").addEventListener("input", calculate);

calculate();