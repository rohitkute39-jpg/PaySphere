
package com.paysphere.backend.seed;

import com.paysphere.backend.compensation.entity.CompensationRecord;
import com.paysphere.backend.compensation.repository.CompensationRepository;
import com.paysphere.backend.department.entity.Department;
import com.paysphere.backend.department.repository.DepartmentRepository;
import com.paysphere.backend.employee.entity.Employee;
import com.paysphere.backend.employee.repository.EmployeeRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Component
public class EmployeeDataSeeder implements CommandLineRunner {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final CompensationRepository compensationRepository;

    @Value("${app.seed.employees.enabled:false}")
    private boolean seedEnabled;

    @Value("${app.seed.employees.target-count:10000}")
    private int targetCount;

    private static final String[] FIRST_NAMES = {
        "Aarav", "Vivaan", "Aditya", "Arjun", "Rahul",
        "Priya", "Ananya", "Sneha", "Isha", "Neha",
        "Rohan", "Karan", "Amit", "Meera", "Sanjay",
        "Emily", "James", "Oliver", "Sophia", "Emma"
    };

    private static final String[] LAST_NAMES = {
        "Sharma", "Patil", "Kulkarni", "Deshmukh", "Joshi",
        "Verma", "Singh", "Mehta", "Pawar", "Gupta",
        "Brown", "Smith", "Wilson", "Taylor", "Martin",
        "Clark", "Lewis", "Walker", "Hall", "Young"
    };

    private static final String[] COUNTRY_CODES = {
        "IN", "US", "GB", "CA", "DE", "AU", "SG", "AE"
    };

    private static final String[] CURRENCIES = {
        "INR", "USD", "GBP", "CAD", "EUR", "AUD", "SGD", "AED"
    };

    private static final String[] DESIGNATIONS = {
        "Software Engineer",
        "Senior Software Engineer",
        "Business Analyst",
        "HR Executive",
        "Financial Analyst",
        "Operations Manager",
        "Sales Executive",
        "Project Manager",
        "Team Lead",
        "Data Analyst"
    };

    public EmployeeDataSeeder(
            EmployeeRepository employeeRepository,
            DepartmentRepository departmentRepository,
            CompensationRepository compensationRepository) {

        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.compensationRepository = compensationRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {

        if (!seedEnabled) {
            System.out.println("Employee data seeding is disabled.");
            return;
        }

        long existingCount = employeeRepository.count();

        if (existingCount >= targetCount) {
            System.out.println("Employee target already reached: " + existingCount);
            return;
        }

        List<Department> departments = departmentRepository.findAll()
                .stream()
                .filter(Department::isActive)
                .sorted(Comparator.comparing(Department::getId))
                .toList();

        if (departments.isEmpty()) {
            throw new IllegalStateException(
                    "No active departments found. Employee seeding cancelled."
            );
        }

        Set<String> employeeNumbers = new HashSet<>();
        Set<String> emails = new HashSet<>();

        employeeRepository.findAll().forEach(employee -> {
            employeeNumbers.add(employee.getEmployeeNumber());
            emails.add(employee.getEmail().toLowerCase(Locale.ROOT));
        });

        int sequence = 4;
        int createdCount = 0;
        int batchSize = 500;

        while (existingCount + createdCount < targetCount) {

            List<Employee> employeeBatch = new ArrayList<>();

            while (employeeBatch.size() < batchSize
                    && existingCount + createdCount + employeeBatch.size()
                    < targetCount) {

                String employeeNumber =
                        String.format(Locale.ROOT, "EMP%03d", sequence);

                String email =
                        String.format(Locale.ROOT,
                                "employee%05d@paysphere.demo", sequence);

                sequence++;

                if (employeeNumbers.contains(employeeNumber)
                        || emails.contains(email.toLowerCase(Locale.ROOT))) {
                    continue;
                }

                int index = sequence - 5;

                int countryIndex = index % COUNTRY_CODES.length;
                int departmentIndex = index % departments.size();

                Employee employee = new Employee();

                employee.setEmployeeNumber(employeeNumber);
                employee.setFirstName(
                        FIRST_NAMES[index % FIRST_NAMES.length]);
                employee.setLastName(
                        LAST_NAMES[index % LAST_NAMES.length]);
                employee.setEmail(email);
                employee.setCountryCode(COUNTRY_CODES[countryIndex]);
                employee.setDesignation(
                        DESIGNATIONS[index % DESIGNATIONS.length]);
                employee.setDepartment(departments.get(departmentIndex));
                employee.setDateOfJoining(
                        LocalDate.now().minusDays(index % 2500));

                employeeBatch.add(employee);

                employeeNumbers.add(employeeNumber);
                emails.add(email.toLowerCase(Locale.ROOT));
            }

            List<Employee> savedEmployees =
                    employeeRepository.saveAll(employeeBatch);

            List<CompensationRecord> salaryBatch = new ArrayList<>();

            for (Employee employee : savedEmployees) {

                int employeeSequence =
                        Integer.parseInt(
                                employee.getEmployeeNumber().substring(3));

                int countryIndex =
                        (employeeSequence - 4) % CURRENCIES.length;

                CompensationRecord record = new CompensationRecord();

                record.setEmployee(employee);
                record.setCurrencyCode(CURRENCIES[countryIndex]);
                record.setAnnualSalary(
                        generateSalary(countryIndex, employeeSequence));
                record.setEffectiveFrom(
                        LocalDate.now().withDayOfMonth(1));
                record.setEffectiveTo(null);
                record.setRevisionReason("Initial seeded salary record");

                salaryBatch.add(record);
            }

            compensationRepository.saveAll(salaryBatch);

            createdCount += savedEmployees.size();

            System.out.println(
                    "Seeded employees: " + createdCount
            );
        }

        System.out.println(
                "Employee seeding completed. Total employees: "
                        + employeeRepository.count()
        );
    }

    private BigDecimal generateSalary(int countryIndex, int sequence) {

        long salary = switch (countryIndex) {
            case 0 -> 600000L + (sequence % 900) * 1000L;
            case 1 -> 65000L + (sequence % 350) * 100L;
            case 2 -> 45000L + (sequence % 300) * 100L;
            case 3 -> 60000L + (sequence % 300) * 100L;
            case 4 -> 50000L + (sequence % 300) * 100L;
            case 5 -> 70000L + (sequence % 300) * 100L;
            case 6 -> 60000L + (sequence % 300) * 100L;
            case 7 -> 180000L + (sequence % 500) * 100L;
            default -> 600000L;
        };

        return BigDecimal.valueOf(salary);
    }
}
