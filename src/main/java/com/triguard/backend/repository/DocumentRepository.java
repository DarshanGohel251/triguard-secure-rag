package com.triguard.backend.repository;
import com.triguard.backend.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
public interface DocumentRepository extends JpaRepository<Document, Long> {
}
