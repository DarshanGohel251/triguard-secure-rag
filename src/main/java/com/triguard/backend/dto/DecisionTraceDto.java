package com.triguard.backend.dto;

import java.util.List;

public class DecisionTraceDto {
    private String identity;
    private String permissionScope;
    private String policyDecision;
    private int candidatesScored;
    private int authorizedChunksRetrieved;
    private int restrictedChunksBlocked;
    private boolean contextAuthorized;
    private String llmModel;
    private int citationsValidated;
    private long executionTimeMs;
    private List<String> completedStages;
    private String status; // "AUTHORIZED", "RESTRICTED", "INJECTION_BLOCKED", "NO_INFO"

    public DecisionTraceDto() {}

    public DecisionTraceDto(String identity, String permissionScope, String policyDecision,
                            int candidatesScored, int authorizedChunksRetrieved, int restrictedChunksBlocked,
                            boolean contextAuthorized, String llmModel, int citationsValidated,
                            long executionTimeMs, List<String> completedStages, String status) {
        this.identity = identity;
        this.permissionScope = permissionScope;
        this.policyDecision = policyDecision;
        this.candidatesScored = candidatesScored;
        this.authorizedChunksRetrieved = authorizedChunksRetrieved;
        this.restrictedChunksBlocked = restrictedChunksBlocked;
        this.contextAuthorized = contextAuthorized;
        this.llmModel = llmModel;
        this.citationsValidated = citationsValidated;
        this.executionTimeMs = executionTimeMs;
        this.completedStages = completedStages;
        this.status = status;
    }

    public String getIdentity() { return identity; }
    public void setIdentity(String identity) { this.identity = identity; }

    public String getPermissionScope() { return permissionScope; }
    public void setPermissionScope(String permissionScope) { this.permissionScope = permissionScope; }

    public String getPolicyDecision() { return policyDecision; }
    public void setPolicyDecision(String policyDecision) { this.policyDecision = policyDecision; }

    public int getCandidatesScored() { return candidatesScored; }
    public void setCandidatesScored(int candidatesScored) { this.candidatesScored = candidatesScored; }

    public int getAuthorizedChunksRetrieved() { return authorizedChunksRetrieved; }
    public void setAuthorizedChunksRetrieved(int authorizedChunksRetrieved) { this.authorizedChunksRetrieved = authorizedChunksRetrieved; }

    public int getRestrictedChunksBlocked() { return restrictedChunksBlocked; }
    public void setRestrictedChunksBlocked(int restrictedChunksBlocked) { this.restrictedChunksBlocked = restrictedChunksBlocked; }

    public boolean isContextAuthorized() { return contextAuthorized; }
    public void setContextAuthorized(boolean contextAuthorized) { this.contextAuthorized = contextAuthorized; }

    public String getLlmModel() { return llmModel; }
    public void setLlmModel(String llmModel) { this.llmModel = llmModel; }

    public int getCitationsValidated() { return citationsValidated; }
    public void setCitationsValidated(int citationsValidated) { this.citationsValidated = citationsValidated; }

    public long getExecutionTimeMs() { return executionTimeMs; }
    public void setExecutionTimeMs(long executionTimeMs) { this.executionTimeMs = executionTimeMs; }

    public List<String> getCompletedStages() { return completedStages; }
    public void setCompletedStages(List<String> completedStages) { this.completedStages = completedStages; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
