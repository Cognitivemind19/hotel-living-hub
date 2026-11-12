const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Stops past dates and keeps check-out at least one night after check-in.
export function bindStayDates(form: HTMLFormElement) {
  const checkIn = form.elements.namedItem('check_in') as HTMLInputElement;
  const checkOut = form.elements.namedItem('check_out') as HTMLInputElement;
  const today = toISO(new Date());

  const sync = () => {
    const next = new Date(`${checkIn.value || today}T00:00`);
    next.setDate(next.getDate() + 1);
    checkOut.min = toISO(next);
    if (checkOut.value && checkOut.value < checkOut.min) checkOut.value = '';
  };

  checkIn.min = today;
  checkIn.addEventListener('change', sync);
  sync();
}
