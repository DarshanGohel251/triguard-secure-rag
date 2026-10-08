package com.triguard.backend.repository;
import com.triguard.backend.entity.SecurityEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface SecurityEventRepository extends JpaRepository<SecurityEvent, Long> {
    List<SecurityEvent> findAllByOrderByTimestampDesc();
}
