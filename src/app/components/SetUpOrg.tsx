"use client";

import React, { useState } from "react";
import { Button, Input, Form, Alert } from "@heroui/react";
import { usePathname, useRouter } from "next/navigation";
import { generateUniqueName } from "@/app/lib/orgCodeGenerator";
import axiosInstance from "@/app/lib/axiosInstance";
import { useSession } from "next-auth/react";
import { useOrganization } from "../context/OrganizationContext";
import { mutate } from "swr";

export default function SetUpOrg() {
  const { data: session } = useSession();
  const [organizationName, setOrganizationName] = useState("");
  const { selectedOrg } = useOrganization();
  const [orgCode, setOrgCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  // useEffect(() => {
  //   if (session) {
  //     console.log("session: ", session);
  //   }
  // }, [session]);

  const handleCreateOrganization = async () => {
    if (!organizationName) {
      setErrorMessage("Please enter an organization name.");
      return;
    }

    setIsCreating(true);
    setErrorMessage("");

    const generatedCode = generateUniqueName(organizationName);

    try {
      await axiosInstance.post("/organization/create-org", {
        email: session?.user?.email,
        organizationName: organizationName,
        organizationCode: generatedCode,
      });

      setSuccessMessage("Organization created successfully!");
      setTimeout(() => {
        setIsCreating(false);
        //re run swrs'
        const dashboardKey = `fetch-dashboard-data::${session?.user?.email}::${selectedOrg}`;
        mutate(dashboardKey);

        const orgKey = `fetch-orgs::${session?.user?.email}`;
        mutate(orgKey);
        if (pathname !== "/dashboard") {
          router.push("/dashboard");
        }
      }, 1000);
    } catch {
      setErrorMessage("Something went wrong while creating the organization.");
      setIsCreating(false);
    }
  };

  const handleJoinRequestToOrganization = async () => {
    if (!orgCode) {
      setErrorMessage("Please enter a valid organization code.");
      return;
    }
    setIsJoining(true);
    setErrorMessage("");

    try {
      const response = await axiosInstance.post(
        "/organization/join-org/request",
        {
          email: session?.user?.email,
          organizationCode: orgCode,
        },
      );

      if (response) setSuccessMessage("Your request to join has been sent.");
      setTimeout(() => {
        setIsJoining(false);
        //router.push("/dashboard"); // Redirect to dashboard after success
      }, 1000);
    } catch {
      setErrorMessage("Failed to request to join to the organization.");
      setIsJoining(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="mb-8">
        <p className="workspace-kicker mb-2">Get started</p>
        <h1 className="workspace-heading">Choose your workspace</h1>
        <p className="workspace-subtitle mt-2">Create an organization for your team or join one with an invite code.</p>
      </header>

      <div>
        {/* Display success or error message */}
        {errorMessage && <Alert color="danger">{errorMessage}</Alert>}
        {successMessage && <Alert color="success">{successMessage}</Alert>}

        <div className="grid gap-5 md:grid-cols-2">
          {/* Option 1: Create a New Organization */}
          <div className="workspace-panel p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900">
              Create an organization
            </h2>
            <p className="mb-6 mt-2 text-sm text-slate-500">Set up a new space for your team&apos;s leads and deals.</p>
            <Form>
              <Input
                label="Organization Name"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Enter organization name"
              />
              <Button
                className="mt-4 rounded-xl font-semibold"
                color="primary"
                size="lg"
                variant="solid"
                onPress={handleCreateOrganization}
                isDisabled={isCreating}
                isLoading={isCreating}
              >
                {isCreating ? "Creating..." : "Create Organization"}
              </Button>
            </Form>
          </div>

          {/* Option 2: Join an Existing Organization */}
          <div className="workspace-panel p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900">Join an organization</h2>
            <p className="mb-6 mt-2 text-sm text-slate-500">Use the invite code shared by your team.</p>
            <Form>
              <Input
                label="Organization Code"
                value={orgCode}
                onChange={(e) => setOrgCode(e.target.value)}
                placeholder="Enter organization code"
              />
              <Button
                className="mt-4 rounded-xl font-semibold"
                color="primary"
                size="lg"
                variant="solid"
                onPress={handleJoinRequestToOrganization}
                isDisabled={isJoining}
                isLoading={isJoining}
              >
                {isJoining ? "Joining..." : "Join Organization"}
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
