import './CheckoutStepper.css';

const steps = ['Cart', 'Shipping', 'Payment', 'Success'];

export default function CheckoutStepper({ current = 0 }) {
  const progressWidth = current > 0 ? `${(current / (steps.length - 1)) * 100}%` : '0%';

  return (
    <div className="checkout-stepper">
      <div className="stepper">
        <div className="stepper-line" />
        <div className="stepper-progress" style={{ width: progressWidth }} />
        {steps.map((label, i) => {
          let status = 'pending';
          if (i < current) status = 'completed';
          if (i === current) status = 'active';

          return (
            <div key={label} className={`step step-${status}`}>
              <div className="step-circle">
                {status === 'completed' ? (
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
                ) : (
                  i + 1
                )}
              </div>
              <span className="step-label">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
