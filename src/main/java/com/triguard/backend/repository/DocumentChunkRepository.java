package com.triguard.backend.repository;
import com.triguard.backend.entity.DocumentChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, Long> {
    List<DocumentChunk> findByDocumentId(Long documentId);
    List<DocumentChunk> findByDocumentIn(List<com.triguard.backend.entity.Document> documents);
}
