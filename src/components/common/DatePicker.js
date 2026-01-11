import React from 'react';



function DatePicker({onDateChange, selectedDate}) {
  const handleDateChange = (event) => {
    onDateChange(event.target.value);
  };

  return (
    <input
      type="date"
      id="date"
      value={selectedDate}
      onChange={handleDateChange}
    />
  );
}

export default DatePicker;