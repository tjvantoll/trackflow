import axios from "axios";

const NOTEHUB_API_URL = "https://api.notefile.net";
const NOTEHUB_AUTH_URL = "https://notehub.io";

interface NotehubConfig {
  clientId: string;
  clientSecret: string;
  projectUID: string;
}

interface NotehubEvent {
  event: string;
  file: string;
  captured: string;
  received: string;
  when: string;
  body: Record<string, unknown>;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export class NotehubAPI {
  private config: NotehubConfig;
  private token: string | null = null;

  constructor() {
    this.config = {
      clientId: process.env.NOTEHUB_CLIENT_ID || "",
      clientSecret: process.env.NOTEHUB_CLIENT_SECRET || "",
      projectUID: process.env.NOTEHUB_PROJECT_UID || "",
    };
  }

  private async getAuthToken(): Promise<string> {
    if (this.token) return this.token;

    try {
      const response = await axios.post<AuthResponse>(
        `${NOTEHUB_AUTH_URL}/oauth2/token`,
        new URLSearchParams({
          grant_type: "client_credentials",
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (!response.data.access_token) {
        throw new Error("No access token received");
      }

      this.token = response.data.access_token;
      return response.data.access_token;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("Error getting auth token:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        });
      } else {
        console.error("Error getting auth token:", error);
      }
      throw error;
    }
  }

  async getEvents(limit: number = 50): Promise<NotehubEvent[]> {
    try {
      const token = await this.getAuthToken();

      const url = `${NOTEHUB_API_URL}/v1/projects/${this.config.projectUID}/events`;
      const params = {
        pageSize: limit,
        files: "_track.qo",
        sortOrder: "desc",
        sortBy: "captured",
      };

      const response = await axios.get<{ events: NotehubEvent[] }>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      return response.data.events;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("Error fetching events:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
          config: {
            url: error.response.config.url,
            params: error.response.config.params,
          },
        });
      } else {
        console.error("Error fetching events:", error);
      }
      throw error;
    }
  }
}
