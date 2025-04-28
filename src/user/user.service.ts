// src/users/users.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from '@azure/storage-blob';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        userName: true,
        email: true,
        dateOfBirth: true,
        twoFactorEnabled: true,
        createdAt: true,
        lastLogIn: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return { status: 'success', data: { user: user } };
  }

  async getUserProfileSasUrl(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user || !user.hashedRt)
      throw new UnauthorizedException(
        'Authentication failed. Please try again.',
      );

    const account = this.config.get<string>('STORAGE_ACCOUNT_NAME') || '';
    const accountKey = this.config.get<string>('STORAGE_KEY') || '';
    const containerName = this.config.get<string>('BLOB_CONTAINER_NAME') || '';
    const sanitizedUserName = encodeURIComponent(user.userName.trim());
    const blobName = `${sanitizedUserName}.jpg`;

    if (!account || !accountKey || !containerName) {
      throw new UnauthorizedException('Incorrect storage credentials');
    }

    const credentials = new StorageSharedKeyCredential(account, accountKey);

    const blobSAS = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse('cwr'), // create, write, read
        expiresOn: new Date(new Date().valueOf() + 3600 * 1000), // 1 hour
      },
      credentials,
    ).toString();

    const sasUrl = `https://${account}.blob.core.windows.net/${containerName}/${blobName}?${blobSAS}`;

    return { status: 'success', data: { uploadUrl: sasUrl } };
  }
}
