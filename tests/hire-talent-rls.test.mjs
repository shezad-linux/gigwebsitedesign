import { test, describe } from "node:test";
import assert from "node:assert/strict";

/* ==============================================================================
   Hire Talent Row Level Security (RLS) & Access Control Test Suite
   Verifies multi-role policy enforcement: Client isolation, Talent privacy,
   Blind proposal protection, and Administrator oversight
   ============================================================================== */

describe("Hire Talent RLS & Access Control Suite", () => {
  // Simulates Postgres RLS evaluation against supabase/hire_talent_schema.sql
  const TABLES = {
    TALENT_PROFILES: "talent_profiles",
    HIRE_REQUESTS: "hire_requests",
    HIRE_MATCHES: "hire_matches",
    HIRE_PROPOSALS: "hire_proposals",
    HIRE_ACTIVITY_LOG: "hire_activity_log",
    HIRE_PROJECTS: "hire_projects",
    HIRE_MILESTONES: "hire_milestones",
    HIRE_TIME_ENTRIES: "hire_time_entries",
  };

  function evaluateHireTalentRls({
    table,
    action, // 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE'
    session, // null (anonymous), { uid: 'user_1', role: 'user' }, or { uid: 'admin_1', role: 'admin' }
    row,
    requestOwnerId = null, // for proposals/matches linked to a request
    isModerator = false,
  }) {
    // 1. Default Deny check
    if (!session) {
      // Anonymous public browsing
      if (table === TABLES.TALENT_PROFILES && action === "SELECT") {
        // Policy: "Verified talent profiles are viewable by everyone"
        return row.verification_status === "verified";
      }
      // All other tables and write operations DENIED anonymously
      return false;
    }

    const { uid, role } = session;
    const hasAdminRole = isModerator || role === "admin" || role === "reviewer";

    // 2. Administrator & Reviewer Permissions
    if (hasAdminRole) {
      if (action === "SELECT") return true;
      if (table === TABLES.HIRE_REQUESTS && action === "UPDATE") return true;
      if (table === TABLES.HIRE_MATCHES && (action === "INSERT" || action === "UPDATE")) return true;
      if (table === TABLES.TALENT_PROFILES && action === "UPDATE") return true;
      if (table === TABLES.HIRE_ACTIVITY_LOG) return true;
      // Admins cannot forge client proposals as themselves
      if (table === TABLES.HIRE_PROPOSALS && action === "INSERT") {
        return row.talent_id === uid;
      }
      return true;
    }

    // 3. Talent Profiles Policies
    if (table === TABLES.TALENT_PROFILES) {
      if (action === "SELECT") {
        // Verified profiles are public; unverified only viewable by self
        return row.verification_status === "verified" || row.user_id === uid;
      }
      if (action === "INSERT" || action === "UPDATE") {
        // Talents can insert/update their own profile
        return row.user_id === uid;
      }
      return false;
    }

    // 4. Hire Requests Policies
    if (table === TABLES.HIRE_REQUESTS) {
      if (action === "SELECT") {
        // Clients can view their own requests
        return row.client_id === uid;
      }
      if (action === "INSERT") {
        // Clients can create requests with their own uid
        return row.client_id === uid;
      }
      if (action === "UPDATE") {
        // Clients can update their own non-completed requests
        return row.client_id === uid && row.status !== "completed" && row.status !== "cancelled";
      }
      return false;
    }

    // 5. Hire Matches Policies
    if (table === TABLES.HIRE_MATCHES) {
      if (action === "SELECT") {
        // Viewable by matched talent or by request owner
        return row.talent_id === uid || requestOwnerId === uid;
      }
      if (action === "UPDATE") {
        // Matched talent can respond (accept/decline)
        return row.talent_id === uid;
      }
      return false; // Only admins insert recommendations
    }

    // 6. Hire Proposals Policies
    if (table === TABLES.HIRE_PROPOSALS) {
      if (action === "SELECT") {
        // Blind bidding: ONLY visible to submitting talent and the target request owner
        return row.talent_id === uid || requestOwnerId === uid;
      }
      if (action === "INSERT") {
        // Talent can submit proposal for themselves
        return row.talent_id === uid;
      }
      if (action === "UPDATE") {
        // Client can accept/decline; Talent can update their pending proposal
        if (requestOwnerId === uid) return true;
        return row.talent_id === uid && row.status === "submitted";
      }
      return false;
    }

    // 7. Hire Projects Policies
    if (table === TABLES.HIRE_PROJECTS) {
      if (action === "SELECT") {
        return row.client_id === uid || row.talent_id === uid;
      }
      if (action === "INSERT") {
        return row.client_id === uid;
      }
      if (action === "UPDATE") {
        return row.client_id === uid || row.talent_id === uid;
      }
      return false;
    }

    // 8. Hire Milestones Policies
    if (table === TABLES.HIRE_MILESTONES) {
      return row.client_id === uid || row.talent_id === uid;
    }

    // 9. Hire Time Entries Policies
    if (table === TABLES.HIRE_TIME_ENTRIES) {
      if (action === "SELECT") {
        return row.client_id === uid || row.talent_id === uid;
      }
      if (action === "INSERT") {
        return row.talent_id === uid;
      }
      if (action === "UPDATE") {
        return row.talent_id === uid || row.client_id === uid;
      }
      return false;
    }

    return false;
  }

  /* -------------------------------------------------------------------------- */
  /* Anonymous Access Rules                                                     */
  /* -------------------------------------------------------------------------- */

  test("anonymous visitors can view verified talent profiles only", () => {
    const verifiedTalent = { verification_status: "verified", user_id: "talent_1" };
    const unverifiedTalent = { verification_status: "pending_review", user_id: "talent_2" };
    const suspendedTalent = { verification_status: "suspended", user_id: "talent_3" };

    const canViewVerified = evaluateHireTalentRls({
      table: TABLES.TALENT_PROFILES,
      action: "SELECT",
      session: null,
      row: verifiedTalent,
    });

    const canViewUnverified = evaluateHireTalentRls({
      table: TABLES.TALENT_PROFILES,
      action: "SELECT",
      session: null,
      row: unverifiedTalent,
    });

    const canViewSuspended = evaluateHireTalentRls({
      table: TABLES.TALENT_PROFILES,
      action: "SELECT",
      session: null,
      row: suspendedTalent,
    });

    assert.equal(canViewVerified, true);
    assert.equal(canViewUnverified, false);
    assert.equal(canViewSuspended, false);
  });

  test("anonymous visitors are strictly denied read/write on client requests and proposals", () => {
    const requestRow = { id: "req_1", client_id: "client_1" };
    const proposalRow = { id: "prop_1", talent_id: "talent_1" };

    assert.equal(
      evaluateHireTalentRls({
        table: TABLES.HIRE_REQUESTS,
        action: "SELECT",
        session: null,
        row: requestRow,
      }),
      false
    );

    assert.equal(
      evaluateHireTalentRls({
        table: TABLES.HIRE_REQUESTS,
        action: "INSERT",
        session: null,
        row: requestRow,
      }),
      false
    );

    assert.equal(
      evaluateHireTalentRls({
        table: TABLES.HIRE_PROPOSALS,
        action: "SELECT",
        session: null,
        row: proposalRow,
      }),
      false
    );
  });

  /* -------------------------------------------------------------------------- */
  /* Client Isolation & Request Ownership                                      */
  /* -------------------------------------------------------------------------- */

  test("clients can view and update their own requests, but NOT requests of others", () => {
    const clientSession = { uid: "client_123", role: "user" };
    const ownRequest = { id: "req_1", client_id: "client_123", status: "submitted" };
    const foreignRequest = { id: "req_2", client_id: "client_999", status: "submitted" };

    // Select own vs foreign
    const canReadOwn = evaluateHireTalentRls({
      table: TABLES.HIRE_REQUESTS,
      action: "SELECT",
      session: clientSession,
      row: ownRequest,
    });

    const canReadForeign = evaluateHireTalentRls({
      table: TABLES.HIRE_REQUESTS,
      action: "SELECT",
      session: clientSession,
      row: foreignRequest,
    });

    assert.equal(canReadOwn, true);
    assert.equal(canReadForeign, false);

    // Update own vs foreign
    const canUpdateOwn = evaluateHireTalentRls({
      table: TABLES.HIRE_REQUESTS,
      action: "UPDATE",
      session: clientSession,
      row: ownRequest,
    });

    const canUpdateForeign = evaluateHireTalentRls({
      table: TABLES.HIRE_REQUESTS,
      action: "UPDATE",
      session: clientSession,
      row: foreignRequest,
    });

    assert.equal(canUpdateOwn, true);
    assert.equal(canUpdateForeign, false);
  });

  test("clients cannot forge requests with another user client_id", () => {
    const clientSession = { uid: "client_123", role: "user" };
    const spoofedRequest = { id: "req_bad", client_id: "client_victim" };

    const canInsertSpoofed = evaluateHireTalentRls({
      table: TABLES.HIRE_REQUESTS,
      action: "INSERT",
      session: clientSession,
      row: spoofedRequest,
    });

    assert.equal(canInsertSpoofed, false);
  });

  /* -------------------------------------------------------------------------- */
  /* Talent Privacy & Blind Bidding Protection                                   */
  /* -------------------------------------------------------------------------- */

  test("proposal is only viewable by submitting talent and the target client (competitors blocked)", () => {
    const talentAlice = { uid: "talent_alice", role: "user" };
    const talentBob = { uid: "talent_bob", role: "user" };
    const projectClient = { uid: "client_owner", role: "user" };

    const aliceProposal = {
      id: "prop_alice",
      request_id: "req_1",
      talent_id: "talent_alice",
      proposed_rate: 85,
    };

    // 1. Alice can view her own proposal
    const aliceCanView = evaluateHireTalentRls({
      table: TABLES.HIRE_PROPOSALS,
      action: "SELECT",
      session: talentAlice,
      row: aliceProposal,
      requestOwnerId: "client_owner",
    });

    // 2. Client owner can view Alice's proposal
    const clientCanView = evaluateHireTalentRls({
      table: TABLES.HIRE_PROPOSALS,
      action: "SELECT",
      session: projectClient,
      row: aliceProposal,
      requestOwnerId: "client_owner",
    });

    // 3. Bob (competitor) CANNOT view Alice's proposal!
    const bobCanView = evaluateHireTalentRls({
      table: TABLES.HIRE_PROPOSALS,
      action: "SELECT",
      session: talentBob,
      row: aliceProposal,
      requestOwnerId: "client_owner",
    });

    assert.equal(aliceCanView, true);
    assert.equal(clientCanView, true);
    assert.equal(bobCanView, false, "Competitor must NOT view another talent's proposal (blind bidding)");
  });

  /* -------------------------------------------------------------------------- */
  /* Administrator & Reviewer Permissions                                       */
  /* -------------------------------------------------------------------------- */

  test("administrators and reviewers have global read and match management authority", () => {
    const adminSession = { uid: "admin_master", role: "admin" };
    const anyRequest = { id: "req_x", client_id: "client_private", status: "matching" };
    const anyProposal = { id: "prop_x", talent_id: "talent_private", proposed_rate: 90 };
    const anyMatch = { id: "match_x", request_id: "req_x", talent_id: "talent_private" };

    assert.equal(
      evaluateHireTalentRls({
        table: TABLES.HIRE_REQUESTS,
        action: "SELECT",
        session: adminSession,
        row: anyRequest,
      }),
      true
    );

    assert.equal(
      evaluateHireTalentRls({
        table: TABLES.HIRE_PROPOSALS,
        action: "SELECT",
        session: adminSession,
        row: anyProposal,
      }),
      true
    );

    // Admin can recommend matches
    assert.equal(
      evaluateHireTalentRls({
        table: TABLES.HIRE_MATCHES,
        action: "INSERT",
        session: adminSession,
        row: anyMatch,
      }),
      true
    );
  });

  test("ordinary users cannot recommend matches directly without admin privileges", () => {
    const standardUser = { uid: "user_normal", role: "user" };
    const matchRow = { id: "match_rogue", request_id: "req_1", talent_id: "talent_friend" };

    const canOrdinaryUserMatch = evaluateHireTalentRls({
      table: TABLES.HIRE_MATCHES,
      action: "INSERT",
      session: standardUser,
      row: matchRow,
    });

    assert.equal(canOrdinaryUserMatch, false, "Standard users cannot forge admin match recommendations");
  });

  /* -------------------------------------------------------------------------- */
  /* Confirmed Projects, Milestones & Time Entries Isolation (Contracts)       */
  /* -------------------------------------------------------------------------- */

  test("confirmed projects are visible only to client, assigned talent, or admins", () => {
    const project = {
      id: "proj_101",
      client_id: "client_alice",
      talent_id: "talent_bob",
      title: "Full-Stack Web App",
      status: "active",
    };

    const clientSession = { uid: "client_alice", role: "user" };
    const talentSession = { uid: "talent_bob", role: "user" };
    const strangerSession = { uid: "user_stranger", role: "user" };
    const adminSession = { uid: "admin_1", role: "admin" };

    assert.equal(
      evaluateHireTalentRls({
        table: TABLES.HIRE_PROJECTS,
        action: "SELECT",
        session: clientSession,
        row: project,
      }),
      true
    );

    assert.equal(
      evaluateHireTalentRls({
        table: TABLES.HIRE_PROJECTS,
        action: "SELECT",
        session: talentSession,
        row: project,
      }),
      true
    );

    assert.equal(
      evaluateHireTalentRls({
        table: TABLES.HIRE_PROJECTS,
        action: "SELECT",
        session: strangerSession,
        row: project,
      }),
      false,
      "Strangers must not view private client-talent contracts"
    );

    assert.equal(
      evaluateHireTalentRls({
        table: TABLES.HIRE_PROJECTS,
        action: "SELECT",
        session: adminSession,
        row: project,
      }),
      true
    );
  });

  test("time entries can only be logged by the assigned talent for themselves", () => {
    const talentBob = { uid: "talent_bob", role: "user" };
    const stranger = { uid: "user_stranger", role: "user" };

    const ownEntry = {
      id: "entry_1",
      project_id: "proj_101",
      talent_id: "talent_bob",
      hours: 4,
    };

    const forgedEntry = {
      id: "entry_2",
      project_id: "proj_101",
      talent_id: "talent_bob",
      hours: 8,
    };

    assert.equal(
      evaluateHireTalentRls({
        table: TABLES.HIRE_TIME_ENTRIES,
        action: "INSERT",
        session: talentBob,
        row: ownEntry,
      }),
      true
    );

    assert.equal(
      evaluateHireTalentRls({
        table: TABLES.HIRE_TIME_ENTRIES,
        action: "INSERT",
        session: stranger,
        row: forgedEntry,
      }),
      false,
      "Strangers cannot log time entries on another talent's contract"
    );
  });

  /* -------------------------------------------------------------------------- */
  /* Column-Level & Trigger Field Security                                     */
  /* -------------------------------------------------------------------------- */

  function simulateProtectTalentVerificationStatus(oldRow, newRow, session) {
    const hasAdminRole = session && (session.role === "admin" || session.role === "reviewer");
    if (oldRow.verification_status !== newRow.verification_status) {
      if (!hasAdminRole) {
        throw new Error("Unauthorized: Only platform administrators can modify talent verification status");
      }
    }
    return newRow;
  }

  function simulateProtectHireRequestAdminFields(oldRow, newRow, session) {
    const hasAdminRole = session && (session.role === "admin" || session.role === "reviewer");
    const result = { ...newRow };
    if (oldRow.internal_notes !== newRow.internal_notes || oldRow.assigned_admin_id !== newRow.assigned_admin_id) {
      if (!hasAdminRole) {
        result.internal_notes = oldRow.internal_notes;
        result.assigned_admin_id = oldRow.assigned_admin_id;
      }
    }
    return result;
  }

  test("triggers prevent non-admin talent from self-verifying verification_status", () => {
    const talentSession = { uid: "talent_alice", role: "user" };
    const adminSession = { uid: "admin_boss", role: "admin" };

    const oldTalent = { id: "talent_alice", verification_status: "pending_review" };
    const tamperedTalent = { id: "talent_alice", verification_status: "verified" };

    // Standard user attempt throws unauthorized error
    assert.throws(
      () => simulateProtectTalentVerificationStatus(oldTalent, tamperedTalent, talentSession),
      /Unauthorized: Only platform administrators can modify talent verification status/
    );

    // Admin attempt succeeds
    const approved = simulateProtectTalentVerificationStatus(oldTalent, tamperedTalent, adminSession);
    assert.equal(approved.verification_status, "verified");
  });

  test("triggers revert non-admin changes to internal_notes and assigned_admin_id", () => {
    const clientSession = { uid: "client_1", role: "user" };
    const adminSession = { uid: "admin_1", role: "admin" };

    const oldReq = {
      id: "req_1",
      internal_notes: "Admin risk rating: low",
      assigned_admin_id: "admin_1",
      title: "My Project",
    };

    const clientTampered = {
      id: "req_1",
      internal_notes: "Client wiped admin notes!",
      assigned_admin_id: "admin_fake",
      title: "My Project Updated",
    };

    // Client update reverts admin fields silently
    const clientResult = simulateProtectHireRequestAdminFields(oldReq, clientTampered, clientSession);
    assert.equal(clientResult.internal_notes, "Admin risk rating: low");
    assert.equal(clientResult.assigned_admin_id, "admin_1");
    assert.equal(clientResult.title, "My Project Updated");

    // Admin update preserves new notes
    const adminResult = simulateProtectHireRequestAdminFields(
      oldReq,
      { ...oldReq, internal_notes: "Reviewed and approved" },
      adminSession
    );
    assert.equal(adminResult.internal_notes, "Reviewed and approved");
  });
});
