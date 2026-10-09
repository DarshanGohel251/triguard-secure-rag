package com.triguard.backend;

import com.triguard.backend.entity.Document;
import com.triguard.backend.entity.DocumentClassification;
import com.triguard.backend.entity.Role;
import com.triguard.backend.entity.User;
import com.triguard.backend.service.DocumentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class SecurityTests {

    @Autowired
    private DocumentService documentService;

    @Test
    void testAdminHasFullAccess() {
        User admin = new User("admin@test.com", "pass", "Admin", Role.ADMIN, "IT");
        Document doc = new Document("Top Secret", "text", DocumentClassification.RESTRICTED, "HR", null, "secret");
        
        assertTrue(documentService.canAccess(admin, doc), "Admin should access RESTRICTED documents");
    }

    @Test
    void testPublicDocumentAccess() {
        User employee = new User("emp@test.com", "pass", "Emp", Role.EMPLOYEE, "Engineering");
        Document doc = new Document("Public Doc", "text", DocumentClassification.PUBLIC, "HR", null, "public info");
        
        assertTrue(documentService.canAccess(employee, doc), "Anyone should access PUBLIC documents");
    }

    @Test
    void testInternalDocumentCrossDepartmentAccess() {
        User empSales = new User("sales@test.com", "pass", "Sales Emp", Role.EMPLOYEE, "Sales");
        Document docFinance = new Document("Finance Internal", "text", DocumentClassification.INTERNAL, "Finance", null, "finance only");
        Document docGeneral = new Document("Company Policy", "text", DocumentClassification.INTERNAL, "General", null, "all internal");
        Document docSales = new Document("Sales Strategy", "text", DocumentClassification.INTERNAL, "Sales", null, "sales internal");

        assertFalse(documentService.canAccess(empSales, docFinance), "Employee should not access INTERNAL documents of another department");
        assertTrue(documentService.canAccess(empSales, docGeneral), "Employee should access INTERNAL General documents");
        assertTrue(documentService.canAccess(empSales, docSales), "Employee should access INTERNAL documents of their own department");
    }

    @Test
    void testConfidentialDocumentAccess() {
        User empSales = new User("emp@sales.com", "pass", "Emp", Role.EMPLOYEE, "Sales");
        User mgrSales = new User("mgr@sales.com", "pass", "Mgr", Role.DEPARTMENT_MANAGER, "Sales");
        User mgrFinance = new User("mgr@finance.com", "pass", "Mgr", Role.DEPARTMENT_MANAGER, "Finance");
        User hrMgr = new User("hr@hr.com", "pass", "HR", Role.HR_MANAGER, "HR");
        
        Document doc = new Document("Confidential Sales", "text", DocumentClassification.CONFIDENTIAL, "Sales", null, "secret");

        assertFalse(documentService.canAccess(empSales, doc), "Normal employee should not access CONFIDENTIAL documents");
        assertTrue(documentService.canAccess(mgrSales, doc), "Department manager should access CONFIDENTIAL documents of their own department");
        assertFalse(documentService.canAccess(mgrFinance, doc), "Department manager should not access CONFIDENTIAL documents of another department");
        assertTrue(documentService.canAccess(hrMgr, doc), "HR manager should access all CONFIDENTIAL documents");
    }

    @Test
    void testRestrictedDocumentAccess() {
        User hrMgr = new User("hr@hr.com", "pass", "HR", Role.HR_MANAGER, "HR");
        User mgrSales = new User("mgr@sales.com", "pass", "Mgr", Role.DEPARTMENT_MANAGER, "Sales");
        User admin = new User("admin@admin.com", "pass", "Admin", Role.ADMIN, "IT");

        Document doc = new Document("Restricted Info", "text", DocumentClassification.RESTRICTED, "Sales", null, "secret");

        assertTrue(documentService.canAccess(hrMgr, doc), "HR manager should access RESTRICTED documents");
        assertFalse(documentService.canAccess(mgrSales, doc), "Department manager should not access RESTRICTED documents");
        assertTrue(documentService.canAccess(admin, doc), "Admin should access RESTRICTED documents");
    }
}
