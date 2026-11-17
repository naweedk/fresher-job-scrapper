"use client";
import React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
// import Link from "next/link";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
// import VerifiedIcon from "@mui/icons-material/Verified";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#ffffff",
        borderTop: "1px solid #e2e8f0",
        mt: "auto",
        py: 3,
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          {/* Brand & tagline */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: 1,
                bgcolor: "primary.main",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <WorkOutlineOutlinedIcon sx={{ fontSize: 14 }} />
            </Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: "#0f172a" }}
            >
              Fresher Jobs India
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                display: { xs: "none", md: "inline" },
              }}
            >
              — Authentic entry-level and fresher jobs across Indian tech hubs.
            </Typography>
          </Box>

          {/* Quick links & badge */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2.5,
              flexWrap: "wrap",
            }}
          >
            {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <VerifiedIcon sx={{ fontSize: 14, color: 'secondary.main' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                100% India-Verified Opportunities
              </Typography>
            </Box> */}

            {/* <Link href="/about" style={{ textDecoration: "none" }}>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 500,
                  "&:hover": { color: "primary.main" },
                }}
              >
                About Pipeline
              </Typography>
            </Link> */}

            <Typography variant="caption" color="text.disabled">
              © {new Date().getFullYear()} Fresher Jobs India
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
