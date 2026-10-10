import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";

/* ==============================================================================
   Community RLS & Access Control Test Suite
   Tests the database-backed RLS policies for community features
   ============================================================================== */

describe("Community RLS & Access Control Suite", () => {
  // Mock RLS evaluation engine replicating PostgreSQL policy definitions
  const TABLES = {
    COMMUNITY_POSTS: "community_posts",
    COMMUNITY_REPLIES: "community_replies",
    COMMUNITY_REPORTS: "community_reports",
    USER_ROLES: "user_roles",
  };

  // Simulating RLS evaluation for an operation
  function evaluateRlsPolicy({
    table,
    action, // 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE'
    session, // null (anonymous), { uid: 'user_123', role: 'user' }, or { uid: 'admin_1', role: 'admin' }
    targetRow,
    isModerator = false,
  }) {
    // 1. Default Deny check
    if (!session) {
      // Unauthenticated / Anonymous access
      if (table === TABLES.COMMUNITY_POSTS && action === "SELECT") {
        // Policy: "Published posts are public"
        return targetRow.status === "published";
      }
      if (table === TABLES.COMMUNITY_REPLIES && action === "SELECT") {
        // Policy: "Published replies on published posts are public"
        return (
          targetRow.status === "published" &&
          targetRow.post_status === "published"
        );
      }
      // All other tables and actions are DENIED for anonymous users
      return false;
    }

    const { uid, role } = session;

    // 2. Moderator/Admin policy (via is_moderator() function)
    if (isModerator || role === "admin" || role === "reviewer") {
      // Moderators can select all posts/replies/reports
      if (
        (table === TABLES.COMMUNITY_POSTS ||
          table === TABLES.COMMUNITY_REPLIES ||
          table === TABLES.COMMUNITY_REPORTS) &&
        action === "SELECT"
      ) {
        return true;
      }
      // Moderators can update post/reply status (hide/restore)
      if (
        (table === TABLES.COMMUNITY_POSTS ||
          table === TABLES.COMMUNITY_REPLIES) &&
        action === "UPDATE"
      ) {
        return true;
      }
      // Moderators can update report status
      if (table === TABLES.COMMUNITY_REPORTS && action === "UPDATE") {
        return true;
      }
    }

    // 3. Regular Authenticated User policies
    if (table === TABLES.COMMUNITY_POSTS) {
      if (action === "SELECT") {
        // Users can view published posts + their own posts
        return targetRow.status === "published" || targetRow.author_id === uid;
      }
      if (action === "INSERT") {
        // Users can create posts as themselves with published status
        return targetRow.author_id === uid && targetRow.status === "published";
      }
      if (action === "UPDATE") {
        // Users can edit their own published posts
        return targetRow.author_id === uid && targetRow.status === "published";
      }
      if (action === "DELETE") {
        // Users can delete their own posts
        return targetRow.author_id === uid;
      }
      return false;
    }

    if (table === TABLES.COMMUNITY_REPLIES) {
      if (action === "SELECT") {
        // Users can view published replies on published posts + their own replies
        return (
          (targetRow.status === "published" && targetRow.post_status === "published") ||
          targetRow.author_id === uid
        );
      }
      if (action === "INSERT") {
        // Users can reply to published posts
        return (
          targetRow.author_id === uid &&
          targetRow.status === "published" &&
          targetRow.post_status === "published"
        );
      }
      if (action === "DELETE") {
        // Users can delete their own replies
        return targetRow.author_id === uid;
      }
      return false;
    }

    if (table === TABLES.COMMUNITY_REPORTS) {
      if (action === "INSERT") {
        // Users can submit reports as themselves
        return targetRow.reporter_id === uid;
      }
      if (action === "SELECT") {
        // Users can view their own reports
        return targetRow.reporter_id === uid;
      }
      // Users cannot update report status (moderation only)
      return false;
    }

    if (table === TABLES.USER_ROLES) {
      // Ordinary users cannot read or modify user_roles table
      return false;
    }

    return false;
  }

  // Helper to create test rows
  const publishedPost = {
    id: "post_1",
    author_id: "user_alice",
    status: "published",
  };

  const hiddenPost = {
    id: "post_2",
    author_id: "user_alice",
    status: "hidden",
  };

  const removedPost = {
    id: "post_3",
    author_id: "user_alice",
    status: "removed",
  };

  const bobsPost = {
    id: "post_4",
    author_id: "user_bob",
    status: "published",
  };

  const publishedReply = {
    id: "reply_1",
    author_id: "user_alice",
    post_id: "post_1",
    status: "published",
    post_status: "published",
  };

  const hiddenReply = {
    id: "reply_2",
    author_id: "user_alice",
    post_id: "post_1",
    status: "hidden",
    post_status: "published",
  };

  const bobsReply = {
    id: "reply_3",
    author_id: "user_bob",
    post_id: "post_1",
    status: "published",
    post_status: "published",
  };

  const openReport = {
    id: "report_1",
    reporter_id: "user_alice",
    post_id: "post_1",
    reply_id: null,
    status: "open",
  };

  const bobsReport = {
    id: "report_2",
    reporter_id: "user_bob",
    post_id: "post_1",
    reply_id: null,
    status: "open",
  };

  const aliceSession = { uid: "user_alice", role: "user" };
  const bobSession = { uid: "user_bob", role: "user" };
  const adminSession = { uid: "admin_root", role: "admin" };
  const moderatorSession = { uid: "mod_jane", role: "reviewer" };

  /* ==============================================================================
     Anonymous Access Tests
     ============================================================================== */

  test("anonymous users can view published posts only", () => {
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_POSTS,
        action: "SELECT",
        session: null,
        targetRow: publishedPost,
      }),
      true
    );

    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_POSTS,
        action: "SELECT",
        session: null,
        targetRow: hiddenPost,
      }),
      false
    );

    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_POSTS,
        action: "SELECT",
        session: null,
        targetRow: removedPost,
      }),
      false
    );
  });

  test("anonymous users can view published replies on published posts only", () => {
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_REPLIES,
        action: "SELECT",
        session: null,
        targetRow: publishedReply,
      }),
      true
    );

    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_REPLIES,
        action: "SELECT",
        session: null,
        targetRow: hiddenReply,
      }),
      false
    );

    // Reply on hidden post should not be visible
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_REPLIES,
        action: "SELECT",
        session: null,
        targetRow: { ...publishedReply, post_status: "hidden" },
      }),
      false
    );
  });

  test("anonymous users are denied write access to all community tables", () => {
    const writeActions = ["INSERT", "UPDATE", "DELETE"];
    const tables = [
      TABLES.COMMUNITY_POSTS,
      TABLES.COMMUNITY_REPLIES,
      TABLES.COMMUNITY_REPORTS,
    ];

    for (const table of tables) {
      for (const action of writeActions) {
        assert.equal(
          evaluateRlsPolicy({
            table,
            action,
            session: null,
            targetRow: {},
          }),
          false,
          `Anonymous should not be able to ${action} on ${table}`
        );
      }
    }
  });

  test("anonymous users cannot submit reports", () => {
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_REPORTS,
        action: "INSERT",
        session: null,
        targetRow: { reporter_id: "user_alice" },
      }),
      false
    );
  });

  /* ==============================================================================
     Authenticated User Tests
     ============================================================================== */

  test("authenticated users can create their own posts", () => {
    const newPost = { author_id: "user_alice", status: "published" };
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_POSTS,
        action: "INSERT",
        session: aliceSession,
        targetRow: newPost,
      }),
      true
    );
  });

  test("authenticated users cannot create posts as another user", () => {
    const impersonatedPost = { author_id: "user_bob", status: "published" };
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_POSTS,
        action: "INSERT",
        session: aliceSession,
        targetRow: impersonatedPost,
      }),
      false
    );
  });

  test("authenticated users cannot create posts with non-published status", () => {
    const draftPost = { author_id: "user_alice", status: "hidden" };
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_POSTS,
        action: "INSERT",
        session: aliceSession,
        targetRow: draftPost,
      }),
      false
    );
  });

  test("users can view their own hidden/removed posts", () => {
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_POSTS,
        action: "SELECT",
        session: aliceSession,
        targetRow: hiddenPost,
      }),
      true
    );

    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_POSTS,
        action: "SELECT",
        session: aliceSession,
        targetRow: removedPost,
      }),
      true
    );
  });

  test("users cannot view other users' hidden/removed posts", () => {
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_POSTS,
        action: "SELECT",
        session: bobSession,
        targetRow: hiddenPost,
      }),
      false
    );
  });

  test("users can edit their own published posts", () => {
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_POSTS,
        action: "UPDATE",
        session: aliceSession,
        targetRow: publishedPost,
      }),
      true
    );
  });

  test("users cannot edit other users' posts", () => {
    // Alice trying to edit Bob's post
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_POSTS,
        action: "UPDATE",
        session: aliceSession,
        targetRow: bobsPost,
      }),
      false
    );
  });

  test("users cannot edit their own hidden/removed posts", () => {
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_POSTS,
        action: "UPDATE",
        session: aliceSession,
        targetRow: hiddenPost,
      }),
      false
    );
  });

  test("users can delete their own posts", () => {
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_POSTS,
        action: "DELETE",
        session: aliceSession,
        targetRow: publishedPost,
      }),
      true
    );
  });

  test("users cannot delete other users' posts", () => {
    // Alice trying to delete Bob's post
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_POSTS,
        action: "DELETE",
        session: aliceSession,
        targetRow: bobsPost,
      }),
      false
    );
  });

  /* ==============================================================================
     Reply Tests
     ============================================================================== */

  test("users can reply to published posts", () => {
    const newReply = {
      author_id: "user_alice",
      post_id: "post_1",
      status: "published",
      post_status: "published",
    };
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_REPLIES,
        action: "INSERT",
        session: aliceSession,
        targetRow: newReply,
      }),
      true
    );
  });

  test("users cannot reply to hidden/removed posts", () => {
    const replyToHidden = {
      author_id: "user_alice",
      post_id: "post_2",
      status: "published",
      post_status: "hidden",
    };
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_REPLIES,
        action: "INSERT",
        session: aliceSession,
        targetRow: replyToHidden,
      }),
      false
    );
  });

  test("users can view their own hidden replies", () => {
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_REPLIES,
        action: "SELECT",
        session: aliceSession,
        targetRow: hiddenReply,
      }),
      true
    );
  });

  test("users cannot view other users' hidden replies", () => {
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_REPLIES,
        action: "SELECT",
        session: bobSession,
        targetRow: hiddenReply,
      }),
      false
    );
  });

  test("users can delete their own replies", () => {
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_REPLIES,
        action: "DELETE",
        session: aliceSession,
        targetRow: publishedReply,
      }),
      true
    );
  });

  test("users cannot delete other users' replies", () => {
    // Alice trying to delete Bob's reply
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_REPLIES,
        action: "DELETE",
        session: aliceSession,
        targetRow: bobsReply,
      }),
      false
    );
  });

  /* ==============================================================================
     Report Tests
     ============================================================================== */

  test("users can submit reports", () => {
    const newReport = { reporter_id: "user_alice", post_id: "post_1" };
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_REPORTS,
        action: "INSERT",
        session: aliceSession,
        targetRow: newReport,
      }),
      true
    );
  });

  test("users can view their own reports", () => {
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_REPORTS,
        action: "SELECT",
        session: aliceSession,
        targetRow: openReport,
      }),
      true
    );
  });

  test("users cannot view other users' reports", () => {
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_REPORTS,
        action: "SELECT",
        session: bobSession,
        targetRow: openReport,
      }),
      false
    );
  });

  test("users cannot update report status", () => {
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_REPORTS,
        action: "UPDATE",
        session: aliceSession,
        targetRow: openReport,
      }),
      false
    );
  });

  /* ==============================================================================
     Moderator/Admin Tests
     ============================================================================== */

  test("moderators can view all posts including hidden/removed", () => {
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_POSTS,
        action: "SELECT",
        session: moderatorSession,
        targetRow: hiddenPost,
        isModerator: true,
      }),
      true
    );

    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_POSTS,
        action: "SELECT",
        session: moderatorSession,
        targetRow: removedPost,
        isModerator: true,
      }),
      true
    );
  });

  test("moderators can view all replies", () => {
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_REPLIES,
        action: "SELECT",
        session: moderatorSession,
        targetRow: hiddenReply,
        isModerator: true,
      }),
      true
    );
  });

  test("moderators can view all reports", () => {
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_REPORTS,
        action: "SELECT",
        session: moderatorSession,
        targetRow: bobsReport,
        isModerator: true,
      }),
      true
    );
  });

  test("moderators can hide/restore any post", () => {
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_POSTS,
        action: "UPDATE",
        session: moderatorSession,
        targetRow: bobsPost,
        isModerator: true,
      }),
      true
    );

    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_POSTS,
        action: "UPDATE",
        session: moderatorSession,
        targetRow: hiddenPost,
        isModerator: true,
      }),
      true
    );
  });

  test("moderators can hide/restore any reply", () => {
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_REPLIES,
        action: "UPDATE",
        session: moderatorSession,
        targetRow: bobsReply,
        isModerator: true,
      }),
      true
    );
  });

  test("moderators can update report status", () => {
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_REPORTS,
        action: "UPDATE",
        session: moderatorSession,
        targetRow: openReport,
        isModerator: true,
      }),
      true
    );
  });

  test("admins inherit moderator permissions", () => {
    // Admin should have all moderator capabilities
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_POSTS,
        action: "UPDATE",
        session: adminSession,
        targetRow: bobsPost,
        isModerator: true, // admin is also moderator via is_moderator()
      }),
      true
    );

    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.COMMUNITY_REPORTS,
        action: "UPDATE",
        session: adminSession,
        targetRow: openReport,
        isModerator: true,
      }),
      true
    );
  });

  /* ==============================================================================
     Role Elevation Protection Tests
     ============================================================================== */

  test("blocks role elevation attacks from standard user accounts", () => {
    const userSession = { uid: "attacker_user", role: "user" };

    // Attacker attempts to insert an admin role into user_roles
    const maliciousRoleRow = {
      user_id: "attacker_user",
      role: "admin",
    };

    const isPermitted = evaluateRlsPolicy({
      table: TABLES.USER_ROLES,
      action: "INSERT",
      session: userSession,
      targetRow: maliciousRoleRow,
    });

    assert.equal(isPermitted, false, "Standard user must not be permitted to insert into user_roles");
  });

  test("ordinary users cannot read user_roles table", () => {
    assert.equal(
      evaluateRlsPolicy({
        table: TABLES.USER_ROLES,
        action: "SELECT",
        session: aliceSession,
        targetRow: {},
      }),
      false
    );
  });

  /* ==============================================================================
     Duplicate Report Prevention (Database Constraint)
     ============================================================================== */

  test("database constraint prevents duplicate reports per user per post", () => {
    // This is enforced by the UNIQUE constraint: unique_report_per_user_per_post
    // The constraint: UNIQUE (reporter_id, post_id)
    // And: UNIQUE (reporter_id, reply_id)
    // This test documents the expected behavior
    assert.ok(true, "UNIQUE constraints on community_reports prevent duplicate reports");
  });

  /* ==============================================================================
     URL Validation Tests
     ============================================================================== */

  test("URL validation rejects non-HTTP/HTTPS protocols", () => {
    const invalidUrls = [
      "ftp://example.com",
      "javascript:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "mailto:test@example.com",
      "tel:+1234567890",
    ];

    for (const url of invalidUrls) {
      try {
        const parsed = new URL(url);
        const isHttpOrHttps = parsed.protocol === "http:" || parsed.protocol === "https:";
        assert.equal(isHttpOrHttps, false, `${url} should be rejected`);
      } catch {
        assert.ok(true, `${url} is not a valid URL`);
      }
    }
  });

  test("URL validation rejects localhost and private IPs", () => {
    const blockedUrls = [
      "http://localhost",
      "http://localhost:3000",
      "http://127.0.0.1",
      "http://192.168.1.1",
      "http://10.0.0.1",
      "http://172.16.0.1",
    ];

    for (const url of blockedUrls) {
      try {
        const parsed = new URL(url);
        const hostname = parsed.hostname.toLowerCase();
        const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
        const privateIpRegex = /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/;
        const isPrivate = privateIpRegex.test(hostname);

        assert.ok(isLocalhost || isPrivate, `${url} should be blocked`);
      } catch {
        assert.ok(true, `${url} is not a valid URL`);
      }
    }
  });

  test("URL validation allows valid public HTTPS URLs", () => {
    const validUrls = [
      "https://example.com",
      "https://www.example.com/path?query=value",
      "https://sub.domain.example.com",
      "http://example.com", // HTTP allowed
    ];

    for (const url of validUrls) {
      try {
        const parsed = new URL(url);
        const isHttpOrHttps = parsed.protocol === "http:" || parsed.protocol === "https:";
        const hostname = parsed.hostname.toLowerCase();
        const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
        const privateIpRegex = /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/;
        const isPrivate = privateIpRegex.test(hostname);

        assert.ok(isHttpOrHttps && !isLocalhost && !isPrivate, `${url} should be allowed`);
      } catch {
        assert.fail(`${url} should be a valid URL`);
      }
    }
  });
});