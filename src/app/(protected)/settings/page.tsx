"use client";

import React, { useState } from "react";
import { Button, Input, Form, Alert } from "@heroui/react";
import { useRouter } from "next/navigation";

export default function OrganizationSetup() {
  const [organizationName, setOrganizationName] = useState("");
  const [orgCode, setOrgCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const handleCreateOrganization = async () => {
    if (!organizationName) {
      setErrorMessage("Please enter an organization name.");
      return;
    }

    // Here you would make an API call to create an organization
    try {
      // Simulate API call for creating an organization
      setIsCreating(true);
      setErrorMessage("");
      setSuccessMessage("Organization created successfully!");
      setTimeout(() => {
        setIsCreating(false);
        router.push("/dashboard"); // Redirect to dashboard after success
      }, 1000);
    } catch (error) {
      setErrorMessage("Something went wrong while creating the organization.");
    }
  };

  const handleJoinOrganization = async () => {
    if (!orgCode) {
      setErrorMessage("Please enter a valid organization code.");
      return;
    }

    // Here you would make an API call to join the organization using the code
    try {
      setIsCreating(true);
      setErrorMessage("");
      setSuccessMessage("Successfully joined the organization!");
      setTimeout(() => {
        setIsCreating(false);
        router.push("/dashboard"); // Redirect to dashboard after success
      }, 1000);
    } catch (error) {
      setErrorMessage("Failed to join the organization.");
    }
  };

  return (
    <div className="container mx-auto max-w-[50%] p-6">
      <h2 className="text-3xl font-semibold mb-6">Set up Your Organization</h2>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Create or Join Organization</h3>

        {/* Display success or error message */}
        {errorMessage && <Alert color="danger">{errorMessage}</Alert>}
        {successMessage && <Alert color="success">{successMessage}</Alert>}

        <div className="flex flex-col gap-6 mb-6">
          {/* Option 1: Create a New Organization */}
          <div className="w-full">
            <h4 className="text-lg font-semibold mb-3">
              Create a New Organization
            </h4>
            <Form>
              <Input
                label="Organization Name"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Enter organization name"
              />
              <Button
                className="mt-4"
                color="primary"
                size="lg"
                variant="solid"
                onPress={handleCreateOrganization}
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create Organization"}
              </Button>
            </Form>
          </div>

          {/* Option 2: Join an Existing Organization */}
          <div className="w-full">
            <h4 className="text-lg font-semibold mb-3">
              Join an Existing Organization
            </h4>
            <Form>
              <Input
                label="Organization Code"
                value={orgCode}
                onChange={(e) => setOrgCode(e.target.value)}
                placeholder="Enter organization code"
              />
              <Button
                className="mt-4"
                color="primary"
                size="lg"
                variant="solid"
                onPress={handleJoinOrganization}
                disabled={isCreating}
              >
                {isCreating ? "Joining..." : "Join Organization"}
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
