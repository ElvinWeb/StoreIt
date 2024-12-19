"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Search from "@/components/Search";
import FileUploader from "@/components/FileUploader";
import { signOutUser } from "@/lib/actions/user.actions";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const Header = ({
  userId,
  accountId,
}: {
  userId: string;
  accountId: string;
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const signOut = async () => {
    setIsLoading(true);
    try {
      await signOutUser();
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  const renderConfirmationDialog = () => {
    return (
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="shad-dialog button">
          <DialogHeader className="flex flex-col gap-4">
            <DialogTitle className="text-center text-2xl text-light-100">
              Sign out
            </DialogTitle>
            <p className="delete-confirmation text-base">
              Are you sure you want to sign out?
            </p>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-3 md:flex-row mt-3">
            <Button
              onClick={() => setIsModalOpen(false)}
              className="modal-cancel-button"
            >
              Cancel
            </Button>
            <Button onClick={signOut} className="modal-submit-button">
              <p className="capitalize">Yes</p>
              {isLoading && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="animate-spin"
                />
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <header className="header">
      <Search />
      <div className="header-wrapper">
        <FileUploader ownerId={userId} accountId={accountId} />
        <Button
          type="submit"
          className="sign-out-button"
          onClick={() => setIsModalOpen(true)}
        >
          <Image
            src="/assets/icons/logout.svg"
            alt="logo"
            width={24}
            height={24}
            className="w-6"
          />
        </Button>
      </div>
      {renderConfirmationDialog()}
    </header>
  );
};
export default Header;
