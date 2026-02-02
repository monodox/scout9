from typing import Dict, Any
from jinja2 import Environment, FileSystemLoader, select_autoescape
import os
from pathlib import Path


class ExportService:
    """
    Service for exporting reports in various formats.
    
    Supports:
    - HTML (rendered template)
    - JSON (raw data export)
    - PDF (HTML to PDF conversion - requires weasyprint or playwright)
    """
    
    def __init__(self):
        # Setup Jinja2 template environment
        template_dir = Path(__file__).parent.parent / "templates"
        self.env = Environment(
            loader=FileSystemLoader(template_dir),
            autoescape=select_autoescape(['html', 'xml'])
        )
    
    def generate_html_report(self, report_data: Dict[str, Any]) -> str:
        """
        Generate HTML report from template.
        
        Args:
            report_data: Complete report data with players, strategies, compositions
        
        Returns:
            Rendered HTML string
        """
        template = self.env.get_template("report_template.html")
        
        # Prepare data for template
        context = {
            "team_name": report_data.get("team_name", "Unknown"),
            "game": report_data.get("game", "Unknown"),
            "created_at": report_data.get("created_at", ""),
            "match_count": report_data.get("match_range", {}).get("match_count", 0),
            "summary": self._format_summary(report_data.get("summary_json", {})),
            "players": report_data.get("players", []),
            "strategies": report_data.get("strategies", []),
            "compositions": report_data.get("compositions", [])
        }
        
        return template.render(**context)
    
    def _format_summary(self, summary_json: Dict[str, Any]) -> str:
        """Convert summary JSON to formatted HTML"""
        if not summary_json:
            return ""
        
        summary_text = summary_json.get("summary", "")
        if summary_text:
            # Convert newlines to HTML paragraphs
            paragraphs = summary_text.split("\n\n")
            formatted = "\n".join([f"<p>{p.replace(chr(10), '<br>')}</p>" for p in paragraphs if p.strip()])
            return formatted
        
        return ""
    
    def generate_json_export(self, report_data: Dict[str, Any]) -> str:
        """
        Generate JSON export of report data.
        
        Returns:
            JSON string
        """
        import json
        return json.dumps(report_data, indent=2, default=str)
    
    def generate_pdf_report(self, html_content: str) -> bytes:
        """
        Convert HTML to PDF.
        
        Note: Requires weasyprint to be installed.
        For production, consider using playwright or a cloud service.
        
        Args:
            html_content: HTML string to convert
        
        Returns:
            PDF bytes
        """
        try:
            from weasyprint import HTML
            pdf_bytes = HTML(string=html_content).write_pdf()
            return pdf_bytes
        except ImportError:
            # Fallback: Return HTML as bytes with a note
            fallback_message = (
                "<!-- PDF generation requires weasyprint. "
                "Install with: pip install weasyprint -->\n"
            )
            return (fallback_message + html_content).encode('utf-8')
        except Exception as e:
            raise Exception(f"Failed to generate PDF: {e}")


export_service = ExportService()
