package com.triguard.backend;

import com.triguard.backend.service.LlmService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class LlmResilienceTests {

    private LlmService llmService;

    @BeforeEach
    public void setup() {
        llmService = new LlmService();
        llmService.initCache();
    }

    @AfterEach
    public void cleanup() {
        System.clearProperty("demo.force.fallback");
    }

    @Test
    public void testDemoCacheWarmedAndHitsLeavePolicy() {
        assertTrue(llmService.getCacheCount() > 0, "Demo cache should contain pre-warmed queries");

        LlmService.CompletionResult result = llmService.resolveFallback(
                "What is the annual leave policy?",
                null,
                "Demo Test"
        );

        assertNotNull(result);
        assertTrue(result.isFallback(), "Result should be marked as fallback");
        assertTrue(result.getText().contains("20 days of paid annual leave"), "Should match leave policy cached answer");
        assertTrue(result.getFallbackReason().contains("Demo Cache"), "Reason should indicate Demo Cache");
    }

    @Test
    public void testDemoCacheAliasMatch() {
        LlmService.CompletionResult result = llmService.resolveFallback(
                "how many days of paid time off do employees get",
                null,
                "Demo Test"
        );

        assertNotNull(result);
        assertTrue(result.getText().contains("20 days"), "Alias should match cached leave policy");
    }

    @Test
    public void testForceFallbackFlag() {
        System.setProperty("demo.force.fallback", "true");
        assertTrue(llmService.isForceFallbackEnabled(), "Force fallback flag should be detected");

        LlmService.CompletionResult result = llmService.generateCompletionWithResilience(
                "Prompt",
                "what is the annual leave policy",
                "Context"
        );

        assertTrue(result.isFallback());
        assertTrue(result.getFallbackReason().contains("Forced Demo Fallback") || result.getFallbackReason().contains("Demo Cache"));
    }

    @Test
    public void testDeterministicGroundedContextFallback() {
        String testContext = "Source: Operations.txt\nText: Corporate data retention duration is 7 years under regulatory compliance.";
        LlmService.CompletionResult result = llmService.resolveFallback(
                "How long is data kept?",
                testContext,
                "Upstream Offline"
        );

        assertNotNull(result);
        assertTrue(result.isFallback());
        assertTrue(result.getText().contains("Corporate data retention duration is 7 years"), "Should extract grounded text from context");
    }

    @Test
    public void testCircuitBreakerInitialState() {
        assertEquals("CLOSED (NORMAL)", llmService.getCircuitBreakerState());
    }
}
