
-- Insert dummy data for queue items with different arms of service
INSERT INTO public.queue (
  full_name, svc_no, gender, arm_of_service, category, rank, marital_status, 
  no_of_adult_dependents, no_of_child_dependents, current_unit, appointment, 
  date_tos, date_sos, phone
) VALUES
-- Nigerian Army personnel
('John Smith', 'A12345', 'Male', 'Nigerian Army', 'NCOs', 'Sergeant', 'Married', 1, 2, '1st Infantry Battalion', 'Squad Leader', '2023-06-15', '2021-03-10', '+234-801-234-5678'),
('Michael Brown', 'A12346', 'Male', 'Nigerian Army', 'Officer', 'Captain', 'Single', 0, 0, '2nd Armoured Regiment', 'Company Commander', '2024-01-20', '2020-05-15', '+234-802-345-6789'),
('Sarah Johnson', 'A12347', 'Female', 'Nigerian Army', 'Officer', 'Lieutenant', 'Married', 1, 1, 'Defence Headquarters', 'Operations Officer', '2023-08-10', '2022-01-25', '+234-803-456-7890'),
('David Wilson', 'A12348', 'Male', 'Nigerian Army', 'NCOs', 'Corporal', 'Divorced', 0, 1, '3rd Artillery Battery', 'Gun Operator', '2023-12-05', '2021-07-30', '+234-804-567-8901'),

-- Nigerian Navy personnel
('James Anderson', 'N54321', 'Male', 'Nigerian Navy', 'NCOs', 'Petty Officer', 'Married', 1, 3, 'Naval Base Lagos', 'Electronics Technician', '2023-09-12', '2020-11-08', '+234-805-678-9012'),
('Lisa Garcia', 'N54322', 'Female', 'Nigerian Navy', 'Officer', 'Lieutenant Commander', 'Single', 0, 0, 'Naval Base Lagos', 'Navigation Officer', '2024-02-28', '2019-04-12', '+234-806-789-0123'),
('Robert Martinez', 'N54323', 'Male', 'Nigerian Navy', 'NCOs', 'Seaman', 'Married', 1, 2, 'Naval Base Lagos', 'Deck Hand', '2023-11-15', '2022-08-20', '+234-807-890-1234'),
('Jennifer Davis', 'N54324', 'Female', 'Nigerian Navy', 'Officer', 'Ensign', 'Single', 0, 0, 'Naval Base Lagos', 'Communications Officer', '2024-03-10', '2023-01-15', '+234-808-901-2345'),

-- Nigerian Air Force personnel
('Christopher Lee', 'AF98765', 'Male', 'Nigerian Air Force', 'NCOs', 'Staff Sergeant', 'Married', 1, 1, 'Nigerian Air Force Base Kaduna', 'Aircraft Mechanic', '2023-07-22', '2021-09-05', '+234-809-012-3456'),
('Amanda Rodriguez', 'AF98766', 'Female', 'Nigerian Air Force', 'Officer', 'Major', 'Divorced', 0, 2, 'Nigerian Air Force Base Kaduna', 'Flight Commander', '2024-01-08', '2018-12-03', '+234-810-123-4567'),
('Kevin Taylor', 'AF98767', 'Male', 'Nigerian Air Force', 'NCOs', 'Airman First Class', 'Single', 0, 0, 'Nigerian Air Force Base Kaduna', 'Radar Operator', '2023-10-30', '2022-06-18', '+234-811-234-5678'),
('Michelle White', 'AF98768', 'Female', 'Nigerian Air Force', 'Officer', 'Captain', 'Married', 1, 1, 'Nigerian Air Force Base Kaduna', 'Pilot', '2024-04-15', '2019-08-22', '+234-812-345-6789');
