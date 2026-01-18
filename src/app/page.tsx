"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";

export default function Page() {
  const projects = useQuery(api.projects.get);
  const createProject = useMutation(api.projects.create);

  if (projects === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <Button
        onClick={() =>
          createProject({
            name: "New Project",
          })
        }
      >
        Add New
      </Button>
      {projects.map((project) => (
        <div className="border rounded p-2 flex-col" key={project._id}>
          <p>{project.name}</p>
          <p>OwnerId: {project.ownerId}</p>
        </div>
      ))}
    </div>
  );
}
